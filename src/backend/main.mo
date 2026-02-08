import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Iter "mo:core/Iter";
import ImportAccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type AppRole = {
    #seller;
    #buyer;
    #admin;
  };

  public type UserProfile = {
    name : Text;
    appRole : AppRole;
    companyName : ?Text;
    gstNumber : ?Text;
    state : ?Text;
  };

  type GSTRate = {
    #cgstSgst : Float;
    #igst : Float;
  };

  type Invoice = {
    id : Text;
    seller : Principal;
    buyer : ?Principal;
    items : [(Text, Nat)];
    status : {
      #draft;
      #sent;
      #verified;
      #rejected;
      #paid;
      #cancelled;
    };
    gstRate : GSTRate;
    placeOfSupply : Text;
    timestamp : Time.Time;
  };

  public type ValidationResult = {
    #ok;
    #billingUnregisteredConsumingPrincipal : Text;
  };

  public type RejectionReason = {
    #unknownPrincipal : Text;
  };

  public type InvoiceStatusUpdate = {
    #draft;
    #sent;
    #verified;
    #rejected;
    #paid;
    #cancelled;
  };

  public type ValidationStatus = {
    #draft;
    #sent;
    #verified : Nat; // include validation score
    #rejected : Text; // include reason
    #paid;
    #cancelled;
  };

  public type Address = {
    street : Text;
    city : Text;
    state : ?Text;
    cityCode : ?Nat;
    gisCoords : ?(Float, Float);
  };

  public type Notification = {
    id : Text;
    user : ?Principal;
    message : Text;
    _type : NotificationType;
    timestamp : Time.Time;
    isRead : Bool;
  };

  public type NotificationType = {
    #invoiceCreated;
    #invoiceStatusUpdate;
    #validationResult;
    #paymentReminder;
    #general;
  };

  type ExternalEnergyReading = {
    appliancePowerUsage : Float; // Watts
    solarGeneration : Float; // kW
    batteryChargeLevel : Float; // Percentage (0-100)
    gridImport : Float; // kWh imported from grid
    gridExport : Float; // kWh exported to grid
    timestamp : Time.Time;
    source : Text; // e.g. "local_sensor", "third_party_api"
  };

  let invoices = Map.empty<Text, Invoice>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let energyReadings = List.empty<ExternalEnergyReading>();

  let accessControlState = ImportAccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to get app role from profile
  private func getUserAppRole(user : Principal) : ?AppRole {
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) { ?profile.appRole };
    };
  };

  // Helper function to check if user has specific app role
  private func hasAppRole(caller : Principal, requiredRole : AppRole) : Bool {
    switch (getUserAppRole(caller)) {
      case (null) { false };
      case (?role) {
        switch (requiredRole, role) {
          case (#admin, #admin) { true };
          case (#seller, #seller) { true };
          case (#buyer, #buyer) { true };
          case (_, _) { false };
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    if (caller != user and not ImportAccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func assignSellerRole(user : Principal, profile : UserProfile) : async () {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };

    if (ImportAccessControl.getUserRole(accessControlState, user) == #guest) {
      ImportAccessControl.assignRole(accessControlState, caller, user, #user);
    };

    let updatedProfile : UserProfile = {
      name = profile.name;
      appRole = #seller;
      companyName = profile.companyName;
      gstNumber = profile.gstNumber;
      state = profile.state;
    };
    userProfiles.add(user, updatedProfile);
  };

  public shared ({ caller }) func assignBuyerRole(user : Principal, profile : UserProfile) : async () {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };

    if (ImportAccessControl.getUserRole(accessControlState, user) == #guest) {
      ImportAccessControl.assignRole(accessControlState, caller, user, #user);
    };

    let updatedProfile : UserProfile = {
      name = profile.name;
      appRole = #buyer;
      companyName = profile.companyName;
      gstNumber = profile.gstNumber;
      state = profile.state;
    };
    userProfiles.add(user, updatedProfile);
  };

  public shared ({ caller }) func assignAdminRole(user : Principal, profile : UserProfile) : async () {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };

    ImportAccessControl.assignRole(accessControlState, caller, user, #admin);

    let updatedProfile : UserProfile = {
      name = profile.name;
      appRole = #admin;
      companyName = profile.companyName;
      gstNumber = profile.gstNumber;
      state = profile.state;
    };
    userProfiles.add(user, updatedProfile);
  };

  public query ({ caller }) func getUserRole(user : Principal) : async ImportAccessControl.UserRole {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view roles");
    };

    if (caller != user and not ImportAccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own role or must be admin");
    };

    ImportAccessControl.getUserRole(accessControlState, user);
  };

  public query ({ caller }) func getAppRole(user : Principal) : async ?AppRole {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view app roles");
    };

    if (caller != user and not ImportAccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own app role or must be admin");
    };

    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) { ?profile.appRole };
    };
  };

  public shared ({ caller }) func createInvoice(
    id : Text,
    buyer : ?Principal,
    items : [(Text, Nat)],
    gstRate : GSTRate,
    pStatus : { #draft; #sent; #verified; #rejected; #paid; #cancelled },
    placeOfSupply : Text,
  ) : async () {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create invoices");
    };

    if (not hasAppRole(caller, #seller)) {
      Runtime.trap("Unauthorized: Only sellers can create invoices");
    };

    switch (invoices.get(id)) {
      case (?_) { Runtime.trap("Invoice with this ID already exists") };
      case (null) {};
    };

    let invoice : Invoice = {
      id;
      seller = caller;
      buyer;
      items;
      status = pStatus;
      gstRate;
      placeOfSupply;
      timestamp = Time.now();
    };

    invoices.add(id, invoice);
  };

  public shared ({ caller }) func createInvoiceCaller(
    id : Text,
    buyer : ?Principal,
    items : [(Text, Nat)],
    gstRate : GSTRate,
    status : {
      #draft;
      #sent;
      #verified;
      #rejected;
      #paid;
      #cancelled;
    },
    placeOfSupply : Text,
  ) : async () {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create invoices");
    };

    if (not hasAppRole(caller, #seller)) {
      Runtime.trap("Unauthorized: Only sellers can create invoices");
    };

    switch (invoices.get(id)) {
      case (?_) { Runtime.trap("Invoice with this ID already exists") };
      case (null) {};
    };

    let invoice : Invoice = {
      id;
      seller = caller;
      buyer;
      items;
      gstRate;
      status;
      placeOfSupply;
      timestamp = Time.now();
    };

    invoices.add(id, invoice);
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view invoices");
    };

    let isAdmin = ImportAccessControl.isAdmin(accessControlState, caller);
    let isSeller = hasAppRole(caller, #seller);
    let isBuyer = hasAppRole(caller, #buyer);

    invoices.values().toArray().filter(
      func(inv) {
        let canView = isAdmin or 
                      (isSeller and inv.seller == caller) or
                      (isBuyer and (switch (inv.buyer) { case (?b) { b == caller }; case (null) { false } }));

        canView;
      }
    );
  };

  public query ({ caller }) func getInvoice(id : Text) : async ?Invoice {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view invoices");
    };

    switch (invoices.get(id)) {
      case (null) { null };
      case (?invoice) {
        let isAdmin = ImportAccessControl.isAdmin(accessControlState, caller);
        let isSeller = invoice.seller == caller;
        let isBuyer = switch (invoice.buyer) {
          case (?b) { b == caller };
          case (null) { false };
        };

        if (not (isAdmin or isSeller or isBuyer)) {
          Runtime.trap("Unauthorized: Can only view your own invoices");
        };

        ?invoice;
      };
    };
  };

  // Public query function - no authentication needed for GST calculation (pure math)
  public query func calculateGST(amount : Float, gstType : GSTRate) : async Float {
    switch (gstType) {
      case (#cgstSgst rate) {
        amount * rate / 100;
      };
      case (#igst rate) {
        amount * rate / 100;
      };
    };
  };

  public shared ({ caller }) func updateInvoice(
    id : Text,
    pStatus : {
      #draft;
      #sent;
      #verified;
      #rejected;
      #paid;
      #cancelled;
    },
  ) : async () {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update invoices");
    };

    let invoice = switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) { invoice };
    };

    // Only the seller or admin can update the invoice
    if (invoice.seller != caller and not ImportAccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the invoice seller or admin can update this invoice");
    };

    // Sellers cannot set status to #verified - only buyers can verify
    if (invoice.seller == caller) {
      switch (pStatus) {
        case (#verified) {
          Runtime.trap("Unauthorized: Only buyers can verify invoices");
        };
        case (_) {};
      };
    };

    let updatedInvoice : Invoice = {
      id = invoice.id;
      seller = invoice.seller;
      buyer = invoice.buyer;
      items = invoice.items;
      gstRate = invoice.gstRate;
      placeOfSupply = invoice.placeOfSupply;
      status = pStatus;
      timestamp = Time.now();
    };

    invoices.add(id, updatedInvoice);
  };

  public shared ({ caller }) func verifyInvoice(id : Text) : async () {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can verify invoices");
    };

    if (not hasAppRole(caller, #buyer)) {
      Runtime.trap("Unauthorized: Only buyers can verify invoices");
    };

    let invoice = switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) { invoice };
    };

    switch (invoice.buyer) {
      case (null) { Runtime.trap("No buyer assigned to this invoice") };
      case (?buyer) {
        if (buyer != caller) {
          Runtime.trap("Unauthorized: Only the assigned buyer can verify this invoice");
        };
      };
    };

    let updatedInvoice : Invoice = {
      id = invoice.id;
      seller = invoice.seller;
      buyer = invoice.buyer;
      items = invoice.items;
      gstRate = invoice.gstRate;
      placeOfSupply = invoice.placeOfSupply;
      status = #verified;
      timestamp = Time.now();
    };

    invoices.add(id, updatedInvoice);
  };

  public shared ({ caller }) func rejectInvoice(id : Text) : async () {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can reject invoices");
    };

    if (not hasAppRole(caller, #buyer)) {
      Runtime.trap("Unauthorized: Only buyers can reject invoices");
    };

    let invoice = switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) { invoice };
    };

    switch (invoice.buyer) {
      case (null) { Runtime.trap("No buyer assigned to this invoice") };
      case (?buyer) {
        if (buyer != caller) {
          Runtime.trap("Unauthorized: Only the assigned buyer can reject this invoice");
        };
      };
    };

    let updatedInvoice : Invoice = {
      id = invoice.id;
      seller = invoice.seller;
      buyer = invoice.buyer;
      items = invoice.items;
      gstRate = invoice.gstRate;
      placeOfSupply = invoice.placeOfSupply;
      status = #rejected;
      timestamp = Time.now();
    };

    invoices.add(id, updatedInvoice);
  };

  public shared ({ caller }) func requestInvoiceModification(id : Text) : async () {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can request modifications");
    };

    if (not hasAppRole(caller, #buyer)) {
      Runtime.trap("Unauthorized: Only buyers can request invoice modifications");
    };

    let invoice = switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) { invoice };
    };

    switch (invoice.buyer) {
      case (null) { Runtime.trap("No buyer assigned to this invoice") };
      case (?buyer) {
        if (buyer != caller) {
          Runtime.trap("Unauthorized: Only the assigned buyer can request modifications");
        };
      };
    };

    let updatedInvoice : Invoice = {
      id = invoice.id;
      seller = invoice.seller;
      buyer = invoice.buyer;
      items = invoice.items;
      gstRate = invoice.gstRate;
      placeOfSupply = invoice.placeOfSupply;
      status = #draft;
      timestamp = Time.now();
    };

    invoices.add(id, updatedInvoice);
  };

  // Add new energy reading
  public shared ({ caller }) func addEnergyReading(
    appliancePowerUsage : Float,
    solarGeneration : Float,
    batteryChargeLevel : Float,
    gridImport : Float,
    gridExport : Float,
    source : Text,
  ) : async () {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add energy readings");
    };

    let reading : ExternalEnergyReading = {
      appliancePowerUsage;
      solarGeneration;
      batteryChargeLevel;
      gridImport;
      gridExport;
      timestamp = Time.now();
      source;
    };

    energyReadings.add(reading);
  };

  // Get latest reading for each metric
  public query ({ caller }) func getLatestReadings() : async ?ExternalEnergyReading {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get latest readings");
    };

    energyReadings.last();
  };

  // Get readings since a given timestamp
  public query ({ caller }) func getReadingsSince(timestamp : Time.Time) : async [ExternalEnergyReading] {
    if (not (ImportAccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get readings");
    };

    energyReadings.toArray().filter(
      func(reading) { reading.timestamp > timestamp }
    );
  };
};

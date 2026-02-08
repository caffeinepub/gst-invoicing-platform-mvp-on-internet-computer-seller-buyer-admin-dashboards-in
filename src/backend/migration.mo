import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type UserProfile = {
    name : Text;
    appRole : {
      #seller;
      #buyer;
      #admin;
    };
    companyName : ?Text;
    gstNumber : ?Text;
    state : ?Text;
  };

  type Invoice = {
    id : Text;
    seller : Principal;
    buyer : ?Principal;
    items : [(Text, Nat)];
    status : { #draft; #sent; #verified; #rejected; #paid; #cancelled };
    gstRate : {
      #cgstSgst : Float;
      #igst : Float;
    };
    placeOfSupply : Text;
    timestamp : Time.Time;
  };

  type OldActor = {
    invoices : Map.Map<Text, Invoice>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type ExternalEnergyReading = {
    appliancePowerUsage : Float;
    solarGeneration : Float;
    batteryChargeLevel : Float;
    gridImport : Float;
    gridExport : Float;
    timestamp : Time.Time;
    source : Text;
  };

  type NewActor = {
    invoices : Map.Map<Text, Invoice>;
    userProfiles : Map.Map<Principal, UserProfile>;
    energyReadings : List.List<ExternalEnergyReading>;
  };

  public func run(old : OldActor) : NewActor {
    { old with energyReadings = List.empty<ExternalEnergyReading>() };
  };
};

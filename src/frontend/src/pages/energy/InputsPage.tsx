import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitEnergyInputs } from '../../services/energyApi';
import { EnergyInputPayload, ApplianceInput } from '../../services/energyTypes';
import { useEnergyFlow } from '../../state/EnergyFlowContext';

interface FormData {
  appliances: ApplianceInput[];
  solarPanelCapacity: number;
  batteryStorage: number;
}

export default function InputsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setInputsSubmitted } = useEnergyFlow();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      appliances: [{ name: '', powerRating: 0, dailyUsageHours: 0, quantity: 1 }],
      solarPanelCapacity: 0,
      batteryStorage: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'appliances',
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload: EnergyInputPayload = {
        appliances: data.appliances,
        solarPanelCapacity: data.solarPanelCapacity,
        batteryStorage: data.batteryStorage,
      };

      await submitEnergyInputs(payload);
      setInputsSubmitted(payload);
      toast.success('Energy inputs submitted successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit inputs';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Energy & Solar Inputs</h1>
        <p className="text-muted-foreground">
          Enter your appliance details and solar panel specifications
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Appliances</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', powerRating: 0, dailyUsageHours: 0, quantity: 1 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Appliance
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border border-border rounded-lg space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Appliance {index + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`appliances.${index}.name`}>Appliance Name *</Label>
                    <Input
                      id={`appliances.${index}.name`}
                      {...register(`appliances.${index}.name`, {
                        required: 'Appliance name is required',
                      })}
                      placeholder="e.g., Refrigerator"
                    />
                    {errors.appliances?.[index]?.name && (
                      <p className="text-sm text-destructive">
                        {errors.appliances[index]?.name?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`appliances.${index}.powerRating`}>Power Rating (Watts) *</Label>
                    <Input
                      id={`appliances.${index}.powerRating`}
                      type="number"
                      step="0.01"
                      {...register(`appliances.${index}.powerRating`, {
                        required: 'Power rating is required',
                        min: { value: 0, message: 'Must be non-negative' },
                        max: { value: 100000, message: 'Must be less than 100,000W' },
                        valueAsNumber: true,
                      })}
                      placeholder="e.g., 150"
                    />
                    {errors.appliances?.[index]?.powerRating && (
                      <p className="text-sm text-destructive">
                        {errors.appliances[index]?.powerRating?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`appliances.${index}.dailyUsageHours`}>
                      Daily Usage (Hours) *
                    </Label>
                    <Input
                      id={`appliances.${index}.dailyUsageHours`}
                      type="number"
                      step="0.1"
                      {...register(`appliances.${index}.dailyUsageHours`, {
                        required: 'Daily usage is required',
                        min: { value: 0, message: 'Must be non-negative' },
                        max: { value: 24, message: 'Cannot exceed 24 hours' },
                        valueAsNumber: true,
                      })}
                      placeholder="e.g., 8"
                    />
                    {errors.appliances?.[index]?.dailyUsageHours && (
                      <p className="text-sm text-destructive">
                        {errors.appliances[index]?.dailyUsageHours?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`appliances.${index}.quantity`}>Quantity *</Label>
                    <Input
                      id={`appliances.${index}.quantity`}
                      type="number"
                      {...register(`appliances.${index}.quantity`, {
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Must be at least 1' },
                        max: { value: 1000, message: 'Must be less than 1000' },
                        valueAsNumber: true,
                      })}
                      placeholder="e.g., 1"
                    />
                    {errors.appliances?.[index]?.quantity && (
                      <p className="text-sm text-destructive">
                        {errors.appliances[index]?.quantity?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Solar Panel & Battery Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="solarPanelCapacity">Solar Panel Capacity (kW) *</Label>
                <Input
                  id="solarPanelCapacity"
                  type="number"
                  step="0.01"
                  {...register('solarPanelCapacity', {
                    required: 'Solar panel capacity is required',
                    min: { value: 0, message: 'Must be non-negative' },
                    max: { value: 10000, message: 'Must be less than 10,000 kW' },
                    valueAsNumber: true,
                  })}
                  placeholder="e.g., 5.5"
                />
                {errors.solarPanelCapacity && (
                  <p className="text-sm text-destructive">{errors.solarPanelCapacity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="batteryStorage">Battery Storage (kWh) *</Label>
                <Input
                  id="batteryStorage"
                  type="number"
                  step="0.01"
                  {...register('batteryStorage', {
                    required: 'Battery storage is required',
                    min: { value: 0, message: 'Must be non-negative' },
                    max: { value: 10000, message: 'Must be less than 10,000 kWh' },
                    valueAsNumber: true,
                  })}
                  placeholder="e.g., 10"
                />
                {errors.batteryStorage && (
                  <p className="text-sm text-destructive">{errors.batteryStorage.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Energy Inputs'
          )}
        </Button>
      </form>
    </div>
  );
}

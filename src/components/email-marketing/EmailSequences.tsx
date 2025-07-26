import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Pause, Edit, Trash2, Target, Clock, Users } from "lucide-react";
import { toast } from "sonner";

interface EmailSequence {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_criteria: any;
  status: string;
  created_at: string;
  enrollments_count?: number;
  steps_count?: number;
}

interface SequenceStep {
  id: string;
  step_order: number;
  template_id: string;
  delay_amount: number;
  delay_unit: string;
  conditions: any;
  template_name?: string;
}

export function EmailSequences() {
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<EmailSequence | null>(null);
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger_type: "signup",
    trigger_criteria: {},
  });

  const [stepData, setStepData] = useState({
    template_id: "",
    delay_amount: 0,
    delay_unit: "hours",
  });

  useEffect(() => {
    fetchSequences();
    fetchTemplates();
  }, []);

  const fetchSequences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("email_sequences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch enrollment counts for each sequence
      const sequencesWithCounts = await Promise.all((data || []).map(async (sequence) => {
        const { count: enrollmentsCount } = await supabase
          .from("email_sequence_enrollments")
          .select("*", { count: "exact", head: true })
          .eq("sequence_id", sequence.id);

        const { count: stepsCount } = await supabase
          .from("email_sequence_steps")
          .select("*", { count: "exact", head: true })
          .eq("sequence_id", sequence.id);

        return {
          ...sequence,
          enrollments_count: enrollmentsCount || 0,
          steps_count: stepsCount || 0,
        };
      }));

      setSequences(sequencesWithCounts);
    } catch (error) {
      console.error("Error fetching sequences:", error);
      toast.error("Failed to load sequences");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("id, name, subject")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const fetchSequenceSteps = async (sequenceId: string) => {
    try {
      const { data, error } = await supabase
        .from("email_sequence_steps")
        .select(`
          *,
          email_templates (name)
        `)
        .eq("sequence_id", sequenceId)
        .order("step_order");

      if (error) throw error;

      const stepsWithTemplateNames = (data || []).map(step => ({
        ...step,
        template_name: step.email_templates?.name || "Unknown Template"
      }));

      setSequenceSteps(stepsWithTemplateNames);
    } catch (error) {
      console.error("Error fetching sequence steps:", error);
    }
  };

  const handleCreateSequence = async () => {
    try {
      if (!formData.name || !formData.trigger_type) {
        toast.error("Name and trigger type are required");
        return;
      }

      const { error } = await supabase
        .from("email_sequences")
        .insert({
          name: formData.name,
          description: formData.description,
          trigger_type: formData.trigger_type,
          trigger_criteria: formData.trigger_criteria,
          status: "active",
        });

      if (error) throw error;

      toast.success("Email sequence created successfully");
      setShowCreateDialog(false);
      setFormData({
        name: "",
        description: "",
        trigger_type: "signup",
        trigger_criteria: {},
      });
      fetchSequences();
    } catch (error) {
      console.error("Error creating sequence:", error);
      toast.error("Failed to create sequence");
    }
  };

  const handleAddStep = async () => {
    if (!selectedSequence || !stepData.template_id) {
      toast.error("Please select a template");
      return;
    }

    try {
      const nextStepOrder = sequenceSteps.length + 1;

      const { error } = await supabase
        .from("email_sequence_steps")
        .insert({
          sequence_id: selectedSequence.id,
          step_order: nextStepOrder,
          template_id: stepData.template_id,
          delay_amount: stepData.delay_amount,
          delay_unit: stepData.delay_unit,
        });

      if (error) throw error;

      toast.success("Step added successfully");
      setStepData({
        template_id: "",
        delay_amount: 0,
        delay_unit: "hours",
      });
      fetchSequenceSteps(selectedSequence.id);
    } catch (error) {
      console.error("Error adding step:", error);
      toast.error("Failed to add step");
    }
  };

  const handleToggleSequenceStatus = async (sequenceId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      
      const { error } = await supabase
        .from("email_sequences")
        .update({ status: newStatus })
        .eq("id", sequenceId);

      if (error) throw error;

      toast.success(`Sequence ${newStatus === "active" ? "activated" : "paused"}`);
      fetchSequences();
    } catch (error) {
      console.error("Error updating sequence status:", error);
      toast.error("Failed to update sequence status");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, text: "Active" },
      inactive: { variant: "secondary" as const, text: "Inactive" },
      paused: { variant: "outline" as const, text: "Paused" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getTriggerBadge = (triggerType: string) => {
    const triggerConfig = {
      signup: { variant: "default" as const, text: "New Signup" },
      purchase: { variant: "default" as const, text: "Purchase" },
      abandon_cart: { variant: "outline" as const, text: "Abandoned Cart" },
      birthday: { variant: "secondary" as const, text: "Birthday" },
      inactive: { variant: "outline" as const, text: "Inactive User" },
    };

    const config = triggerConfig[triggerType as keyof typeof triggerConfig] || { variant: "outline" as const, text: triggerType };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDelay = (amount: number, unit: string) => {
    if (amount === 0) return "Immediately";
    return `${amount} ${unit}${amount !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading sequences...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Email Sequences</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Sequence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Email Sequence</DialogTitle>
              <DialogDescription>
                Create an automated email sequence that triggers based on user actions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sequence-name">Sequence Name</Label>
                <Input
                  id="sequence-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Welcome Series"
                />
              </div>
              
              <div>
                <Label htmlFor="sequence-description">Description</Label>
                <Textarea
                  id="sequence-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A series of welcome emails for new subscribers"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="trigger-type">Trigger Type</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signup">New Signup</SelectItem>
                    <SelectItem value="purchase">Purchase Made</SelectItem>
                    <SelectItem value="abandon_cart">Abandoned Cart</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="inactive">Inactive User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSequence}>
                  Create Sequence
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sequences.map((sequence) => (
          <Card key={sequence.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{sequence.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {sequence.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(sequence.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleSequenceStatus(sequence.id, sequence.status)}
                  >
                    {sequence.status === "active" ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trigger:</span>
                  {getTriggerBadge(sequence.trigger_type)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{sequence.steps_count || 0} steps</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{sequence.enrollments_count || 0} enrolled</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedSequence(sequence);
                      fetchSequenceSteps(sequence.id);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Manage Steps
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sequences.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sequences yet</h3>
            <p className="text-muted-foreground mb-4">
              Create automated email sequences to nurture your subscribers.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Sequence
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sequence Steps Management Dialog */}
      <Dialog open={!!selectedSequence} onOpenChange={() => setSelectedSequence(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Sequence Steps - {selectedSequence?.name}</DialogTitle>
            <DialogDescription>
              Configure the steps in your email sequence.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Existing Steps */}
            <div>
              <h4 className="font-semibold mb-3">Current Steps</h4>
              {sequenceSteps.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No steps added yet. Add your first step below.
                </p>
              ) : (
                <div className="space-y-3">
                  {sequenceSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                        {step.step_order}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{step.template_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {index === 0 ? "Immediately" : `Wait ${formatDelay(step.delay_amount, step.delay_unit)}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Step */}
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-3">Add New Step</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="step-template">Email Template</Label>
                  <Select
                    value={stepData.template_id}
                    onValueChange={(value) => setStepData(prev => ({ ...prev, template_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="step-delay">Delay Amount</Label>
                  <Input
                    id="step-delay"
                    type="number"
                    value={stepData.delay_amount}
                    onChange={(e) => setStepData(prev => ({ ...prev, delay_amount: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="step-unit">Delay Unit</Label>
                  <Select
                    value={stepData.delay_unit}
                    onValueChange={(value) => setStepData(prev => ({ ...prev, delay_unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleAddStep}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Step
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

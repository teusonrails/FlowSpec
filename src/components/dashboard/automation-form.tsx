"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  createAutomation,
  updateAutomation,
  submitForReview,
  deleteAutomation,
  archiveAutomation,
} from "@/lib/actions/automation";
import { DOMAIN_CONFIG, COMPLEXITY_CONFIG } from "@/lib/utils/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AutomationStatus, Domain, Complexity } from "@/generated/prisma";

interface Option {
  id: string;
  name: string;
}

interface AutomationFormProps {
  automationId?: string;
  defaultValues?: {
    name: string;
    description: string;
    longDescription: string;
    domain: string;
    complexity: string;
    tier: string;
    version: string;
    setupTime?: number;
    priceStarter?: number;
    pricePro?: number;
    priceAgency?: number;
    flowspecContent: string;
    platformIds: string[];
    toolIds: string[];
    aiModelIds: string[];
    tagIds: string[];
  };
  status?: AutomationStatus;
  platforms: Option[];
  tools: Option[];
  aiModels: Option[];
  tags: Option[];
}

const steps = [
  "Basics",
  "Details",
  "Integrations",
  "Pricing",
  "FlowSpec",
  "Review",
];

export function AutomationForm({
  automationId,
  defaultValues,
  status,
  platforms,
  tools,
  aiModels,
  tags,
}: AutomationFormProps) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!automationId;

  // Form state
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [longDescription, setLongDescription] = useState(
    defaultValues?.longDescription ?? ""
  );
  const [domain, setDomain] = useState(defaultValues?.domain ?? "");
  const [complexity, setComplexity] = useState(
    defaultValues?.complexity ?? ""
  );
  const [tier, setTier] = useState(defaultValues?.tier ?? "OPEN");
  const [version, setVersion] = useState(defaultValues?.version ?? "1.0.0");
  const [setupTime, setSetupTime] = useState(
    defaultValues?.setupTime?.toString() ?? ""
  );
  const [priceStarter, setPriceStarter] = useState(
    defaultValues?.priceStarter?.toString() ?? ""
  );
  const [pricePro, setPricePro] = useState(
    defaultValues?.pricePro?.toString() ?? ""
  );
  const [priceAgency, setPriceAgency] = useState(
    defaultValues?.priceAgency?.toString() ?? ""
  );
  const [flowspecContent, setFlowspecContent] = useState(
    defaultValues?.flowspecContent ?? ""
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    defaultValues?.platformIds ?? []
  );
  const [selectedTools, setSelectedTools] = useState<string[]>(
    defaultValues?.toolIds ?? []
  );
  const [selectedAiModels, setSelectedAiModels] = useState<string[]>(
    defaultValues?.aiModelIds ?? []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    defaultValues?.tagIds ?? []
  );

  function toggleSelection(
    id: string,
    selected: string[],
    setSelected: (v: string[]) => void
  ) {
    setSelected(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  }

  function handleSubmit() {
    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    if (longDescription) formData.set("longDescription", longDescription);
    formData.set("domain", domain);
    formData.set("complexity", complexity);
    formData.set("tier", tier);
    formData.set("version", version);
    if (setupTime) formData.set("setupTime", setupTime);
    if (priceStarter) formData.set("priceStarter", priceStarter);
    if (pricePro) formData.set("pricePro", pricePro);
    if (priceAgency) formData.set("priceAgency", priceAgency);
    if (flowspecContent) formData.set("flowspecContent", flowspecContent);
    selectedPlatforms.forEach((id) => formData.append("platformIds", id));
    selectedTools.forEach((id) => formData.append("toolIds", id));
    selectedAiModels.forEach((id) => formData.append("aiModelIds", id));
    selectedTags.forEach((id) => formData.append("tagIds", id));

    startTransition(async () => {
      const result = isEdit
        ? await updateAutomation(automationId!, formData)
        : await createAutomation(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (isEdit) {
        toast.success("Automation updated");
      }
    });
  }

  function handleSubmitForReview() {
    if (!automationId) return;
    startTransition(async () => {
      const result = await submitForReview(automationId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Submitted for review");
      }
    });
  }

  function handleDelete() {
    if (!automationId) return;
    if (!confirm("Are you sure you want to delete this automation?")) return;
    startTransition(async () => {
      const result = await deleteAutomation(automationId);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  function handleArchive() {
    if (!automationId) return;
    startTransition(async () => {
      const result = await archiveAutomation(automationId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Automation archived");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
              i === step
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {/* Step 1: Basics */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Name, description, and categorization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Automation Workflow"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this automation does"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label>Domain *</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
                  <Badge
                    key={key}
                    variant={domain === key ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setDomain(key)}
                  >
                    {config.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Complexity *</Label>
              <div className="flex gap-2">
                {Object.entries(COMPLEXITY_CONFIG).map(([key, config]) => (
                  <Badge
                    key={key}
                    variant={complexity === key ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setComplexity(key)}
                  >
                    {config.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Extended description and version info
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="Detailed description of your automation..."
                rows={6}
                maxLength={5000}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setupTime">Setup Time (minutes)</Label>
                <Input
                  id="setupTime"
                  type="number"
                  value={setupTime}
                  onChange={(e) => setSetupTime(e.target.value)}
                  placeholder="15"
                  min={1}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Integrations */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Platforms, tools, AI models, and tags
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Platforms * (select at least one)</Label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <Badge
                    key={p.id}
                    variant={
                      selectedPlatforms.includes(p.id) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      toggleSelection(
                        p.id,
                        selectedPlatforms,
                        setSelectedPlatforms
                      )
                    }
                  >
                    {p.name}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Tools</Label>
              <div className="flex flex-wrap gap-2">
                {tools.map((t) => (
                  <Badge
                    key={t.id}
                    variant={
                      selectedTools.includes(t.id) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      toggleSelection(t.id, selectedTools, setSelectedTools)
                    }
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>AI Models</Label>
              <div className="flex flex-wrap gap-2">
                {aiModels.map((m) => (
                  <Badge
                    key={m.id}
                    variant={
                      selectedAiModels.includes(m.id) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      toggleSelection(
                        m.id,
                        selectedAiModels,
                        setSelectedAiModels
                      )
                    }
                  >
                    {m.name}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Badge
                    key={t.id}
                    variant={
                      selectedTags.includes(t.id) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      toggleSelection(t.id, selectedTags, setSelectedTags)
                    }
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Pricing */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Set tier and pricing for your automation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tier</Label>
              <div className="flex gap-2">
                {["FREE", "OPEN", "CURATED"].map((t) => (
                  <Badge
                    key={t}
                    variant={tier === t ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setTier(t)}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                FREE: no charge. OPEN: self-published marketplace. CURATED:
                reviewed and promoted by FlowSpec.
              </p>
            </div>

            {tier !== "FREE" && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceStarter">Starter Price (cents)</Label>
                  <Input
                    id="priceStarter"
                    type="number"
                    value={priceStarter}
                    onChange={(e) => setPriceStarter(e.target.value)}
                    placeholder="999"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePro">Pro Price (cents)</Label>
                  <Input
                    id="pricePro"
                    type="number"
                    value={pricePro}
                    onChange={(e) => setPricePro(e.target.value)}
                    placeholder="2499"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceAgency">Agency Price (cents)</Label>
                  <Input
                    id="priceAgency"
                    type="number"
                    value={priceAgency}
                    onChange={(e) => setPriceAgency(e.target.value)}
                    placeholder="4999"
                    min={0}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: FlowSpec */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>FlowSpec Content</CardTitle>
            <CardDescription>
              Paste or write your FlowSpec workflow definition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={flowspecContent}
              onChange={(e) => setFlowspecContent(e.target.value)}
              placeholder="# FlowSpec v1.0&#10;&#10;name: My Automation&#10;description: ...&#10;&#10;steps:&#10;  - ..."
              rows={20}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Step 6: Review & Submit */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>Review your automation before saving</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="font-medium">{name || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Domain:</span>{" "}
                <span className="font-medium">
                  {domain
                    ? DOMAIN_CONFIG[domain as Domain]?.label ?? domain
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Complexity:</span>{" "}
                <span className="font-medium">
                  {complexity
                    ? COMPLEXITY_CONFIG[complexity as Complexity]?.label ??
                      complexity
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Tier:</span>{" "}
                <span className="font-medium">{tier}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Platforms:</span>{" "}
                <span className="font-medium">
                  {selectedPlatforms.length > 0
                    ? platforms
                        .filter((p) => selectedPlatforms.includes(p.id))
                        .map((p) => p.name)
                        .join(", ")
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Version:</span>{" "}
                <span className="font-medium">{version}</span>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              {description || "No description provided"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
          {step < steps.length - 1 && (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          )}
        </div>

        <div className="flex gap-2">
          {isEdit && status === "DRAFT" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
            >
              Delete
            </Button>
          )}
          {isEdit && status === "PUBLISHED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              disabled={isPending}
            >
              Archive
            </Button>
          )}
          {step === steps.length - 1 && (
            <>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending
                  ? "Saving..."
                  : isEdit
                    ? "Save Changes"
                    : "Create Draft"}
              </Button>
              {isEdit && status === "DRAFT" && (
                <Button
                  variant="secondary"
                  onClick={handleSubmitForReview}
                  disabled={isPending}
                >
                  Submit for Review
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

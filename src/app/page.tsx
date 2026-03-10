import Link from "next/link";
import { ArrowRight, Zap, Users, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Automations", value: "250+", icon: Package },
  { label: "Creators", value: "50+", icon: Users },
  { label: "Avg Rating", value: "4.8", icon: Star },
];

const features = [
  {
    title: "Production-Ready Specs",
    description:
      "Every automation is validated against the FlowSpec standard before listing.",
  },
  {
    title: "Multi-Platform",
    description:
      "Workflows for Make.com, Zapier, n8n, Power Automate, and more.",
  },
  {
    title: "AI-Powered",
    description:
      "Automations leveraging GPT-4, Claude, Gemini, and other AI models.",
  },
  {
    title: "Creator Economy",
    description:
      "Build and sell your automations. Earn up to 75% of every sale.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Zap className="h-3.5 w-3.5" />
            The marketplace for AI automations
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
            Discover & Deploy{" "}
            <span className="text-primary">AI Automations</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Browse production-ready automation workflows. Buy, download, and
            deploy in minutes — or sell your own.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/catalog">
                Browse Marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Become a Creator</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl md:text-3xl font-bold">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why FlowSpec?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to automate?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join our marketplace of automation creators and buyers.
          </p>
          <Button size="lg" asChild>
            <Link href="/catalog">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

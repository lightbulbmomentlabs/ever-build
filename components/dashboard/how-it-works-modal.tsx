'use client';

/**
 * How It Works Modal
 *
 * Educational modal explaining the EverBuild system to new users.
 * Breaks down projects, phases, tasks, contacts, and timeline features
 * in a friendly, digestible way.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Home, Layout, CheckSquare, Users, Calendar } from 'lucide-react';

interface HowItWorksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowItWorksModal({ open, onOpenChange }: HowItWorksModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-charcoal-blue">
              How EverBuild Works
            </DialogTitle>
            <p className="text-steel-gray mt-2">
              Everything you need to manage your builds, organized and connected.
            </p>
          </DialogHeader>
        </div>

        <div className="space-y-6 py-4 px-6 overflow-y-auto flex-1">
          {/* Projects */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-everbuild-orange/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-everbuild-orange" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-charcoal-blue mb-2">
                Projects
              </h3>
              <p className="text-sm text-steel-gray leading-relaxed">
                Each project represents one build—whether it's a spec home or a custom build.
                Think of it as the top-level container for everything related to that specific property.
              </p>
            </div>
          </div>

          {/* Phases */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-blueprint-teal/10 flex items-center justify-center">
                <Layout className="w-6 h-6 text-blueprint-teal" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-charcoal-blue mb-2">
                Phases
              </h3>
              <p className="text-sm text-steel-gray leading-relaxed">
                Phases break your project into major stages like "Foundation," "Framing," or
                "Electrical." They help you see the big picture and track progress through each
                milestone. Phases can be set to start automatically when the previous one finishes.
              </p>
            </div>
          </div>

          {/* Tasks */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-success-green/10 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-success-green" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-charcoal-blue mb-2">
                Tasks
              </h3>
              <p className="text-sm text-steel-gray leading-relaxed">
                Within each phase, you can create specific tasks for the detailed work that needs
                to happen. Think "Order materials," "Schedule inspection," or "Install HVAC."
                Tasks keep you organized and ensure nothing falls through the cracks.
              </p>
            </div>
          </div>

          {/* Contacts */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-charcoal-blue mb-2">
                Contacts
              </h3>
              <p className="text-sm text-steel-gray leading-relaxed">
                Keep all your subs, vendors, and team members in one place. You can assign contacts
                to specific phases and tasks, so you always know who's responsible for what—and have
                their info right when you need it.
              </p>
            </div>
          </div>

          {/* Timeline View */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-warning-amber/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning-amber" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-charcoal-blue mb-2">
                Timeline & Dependencies
              </h3>
              <p className="text-sm text-steel-gray leading-relaxed">
                See your entire project timeline at a glance. Set dependencies between phases
                so when one finishes, the next starts automatically. Adjust dates and watch
                everything update in real-time—no spreadsheet juggling required.
              </p>
            </div>
          </div>

          {/* How It All Connects */}
          <div className="mt-6 p-4 rounded-lg bg-concrete-white border border-steel-gray/20">
            <h4 className="font-semibold text-charcoal-blue mb-2">
              How It All Connects
            </h4>
            <p className="text-sm text-steel-gray leading-relaxed">
              Create a <span className="font-semibold text-charcoal-blue">project</span>,
              break it into <span className="font-semibold text-charcoal-blue">phases</span>,
              add <span className="font-semibold text-charcoal-blue">tasks</span> to each phase,
              assign <span className="font-semibold text-charcoal-blue">contacts</span> to the work,
              and track it all on your <span className="font-semibold text-charcoal-blue">timeline</span>.
              It's that simple. Everything stays connected, so you're always in control.
            </p>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t bg-white flex-shrink-0">
          <Button onClick={() => onOpenChange(false)} size="lg">
            Got It, Let's Build!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

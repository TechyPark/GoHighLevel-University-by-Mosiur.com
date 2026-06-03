export interface UTMData {
  source: string;
  medium: string;
  campaign: string;
}

export interface HistoryEntry {
  date: string;
  event: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "prospect" | "hot-lead" | "scheduled" | "won" | "lost";
  source: string;
  avatar: string;
  tags: string[];
  utm: UTMData;
  history: HistoryEntry[];
}

export interface WorkflowAction {
  id: string;
  type: "tag" | "sms" | "email" | "pipeline" | "wait";
  params: {
    mode?: "add" | "remove";
    tag?: string;
    body?: string;
    subject?: string;
    stage?: "prospect" | "hot-lead" | "scheduled" | "won" | "lost";
    duration?: number;
  };
  label: string;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  description: string;
  actions: WorkflowAction[];
}

export interface AcademyMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isGrounded?: boolean;
}

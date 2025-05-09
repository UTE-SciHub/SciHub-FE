import { Council } from "@/models/council";
import { Topic } from "@/models/topic";

export interface TopicCouncil {
    id: number;
    topic: Topic;
    council: Council;
    notes?: string;
}

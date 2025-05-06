import { Council } from "@/models/council";
import { CouncilType } from "@/models/enums/council-type.enum";
import { Topic } from "@/models/topic";

export interface TopicCouncil {
    id: number;
    topic: Topic;
    council: Council;
    type: CouncilType;
    notes?: string;
}

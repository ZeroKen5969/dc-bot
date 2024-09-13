import crewStageDao from "../database/crewStageDao";
   
 
import { EventType } from "../utils/types";

export = {
    name: EventType.CrewRaidReseted,

    async execute(client: ZClient) {
        await crewStageDao.clearRecords();
    }
} as Executor;
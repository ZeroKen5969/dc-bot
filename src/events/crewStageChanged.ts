import crewStageDao from "../database/crewStageDao";
import { EventType } from "../utils/types";

export = {
    name: EventType.CrewStageChanged,

    async execute(client: ZClient, recordID: string, stage: number, record: Game.PersonalRaidStageRecord) {
        const [uuid, scount] = recordID.split("_");
        const count = parseInt(scount);

        const [teamStr, upgradeStr] = (function(data: Game.PersonalRaidStageRecord) {
            let deck = data.DiceDeckNum.map((e) => [e.Id, e.Special || 0, e.Upgrade]);

            // 祝福圖只排序中間三個骰子, 其餘則正常排序
            if (data.Skin == 10) {
                deck = [deck[0], ...deck.slice(1, 4).sort(([x], [y]) => x - y), deck[4]];
            } else {
                deck = deck.sort(([x], [y]) => x - y);
            }

            const [team, upgrade] = deck.reduce(
                ([_team, _upgrade]: [number[], number[]], [x, y, z]) => {
                    _team.push(x, y);
                    _upgrade.push(z);
                    return [_team, _upgrade];
                },
                [[], []]
            );
            return [team.concat(data.Skin).join(","), upgrade.join(",")];
        })(record);

        await crewStageDao.addTeamRecord(uuid, stage, count, teamStr, upgradeStr, record.Score, record.PlayTime);
    }
} as Executor;
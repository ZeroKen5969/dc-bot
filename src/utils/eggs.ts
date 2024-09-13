import moment from "./moment";
import { EggRuleType, EggType } from "./types";

export default [{
    from: ["uid00"],
    content: "早安",
    type: EggType.PartWithStartSame,
    echo: {
        index: 0,
        content: "早安",
    },
    errEcho: {
        [1]: {
            index: -999,
            content: "現在太早了吧",
        }, [2]: {
            index: -999,
            content: "現在不早了",
        }
    },
    conditionFn: function (): number {
        const curr = moment().utcOffset(8);
        const hour = parseInt(curr.format('H'));
        if (hour >= 0 && hour <= 5) return 1;
        if (hour >= 12 && hour <= 23) return 2;
        return 0;
    }
}, {
    from: ["uid00"],
    content: "晚安",
    type: EggType.PartWithStartSame,
    echo: {
        index: 0,
        content: "晚安",
    },
    errEcho: {
        [1]: {
            index: -999,
            content: "現在不晚吧",
        }, [2]: {
            index: -999,
            content: "現在晚了",
        }
    },
    conditionFn: function (): number {
        const curr = moment().utcOffset(8);
        const hour = parseInt(curr.format('H'));
        if (hour >= 23 || hour <= 1) return 0;
        if (hour >= 2 && hour <= 5) return 2;
        return 1;
    }
}, {
    from: ["uidzz"],
    content: ["測試"],
    type: EggType.PartSame,
    rules: [EggRuleType.IgnoreCase, EggRuleType.Multiple],
    echo: {
        index: 1,
        content: "測試測試",
    }
}];
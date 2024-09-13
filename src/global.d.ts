
import Discord from "discord.js";
import kazagumo from "kazagumo";
import { Moment } from "moment-timezone";
import { Document, MongoClient, WithId } from "mongodb";
import { ChatClient } from "../photon/ChatClient";

declare global {
    type Dict<T> = {
        [key: number]: T;
        [key: string]: T;
    }

    namespace NodeJS {
        interface ProcessEnv {
            // 資料庫相關
            DB_USER: string;
            DB_PASS: string;
            DB_HOST: string;
            DB_OPTION: string;

            // Discord相關
            BOT_TOKEN: string;
            BOT_PREFIX: string;

            // 主要伺服器
            MAIN_GUILD: string;

            // photon
            AppIdRealtime: string;
            AppIdChat: string;
            GameVersion: string;
            PunVersion: string;
        }
    }

    namespace Plugin {
        interface Command {
            commands: Discord.Collection<string, Executor>;
            slashes: Discord.Collection<string, Executor>;
            aliases: Discord.Collection<string, Executor>;
            listens: Discord.Collection<string, Executor>;

            loadCommands(this: ZClient): Promise<any>;
            registerSlashCommands(this: ZClient): Promise<void>;
        }

        interface Task {
            tasks: Discord.Collection<string, Executor>;
            loadTasks(this: ZClient): Promise<any>;
            runTasks(this: ZClient): void;
        }

        interface Event {
            loadEvents(this: ZClient): Promise<any>;
        }

        interface Message {
            loadMessages(this: ZClient): void;
        }

        interface Preference {
            prefix: string;
            mainGuild: string;
            cooldown: Discord.Collection<string, number>;
            botStatus: Discord.Collection<string, boolean>;
            updateCoolDown(this: ZClient, message: Discord.Message, exec: Executor): void;
            coolDownExpired(this: ZClient, message: Discord.Message, exec: Executor): boolean;
            getChannelInfo(this: ZClient, gid: string, cid: string, author?: Discord.User): BotMessage;
        }

        interface PlayerManager {
            manager: kazagumo.Kazagumo;
            restoreMusicStatus(this: ZClient): Promise<void>;
        }

        interface GameManager {
            gameVersion: string;
            chatClients: Dict<ChatClient>;
            newChatClient(this: ZClient, uuid: string, isMain: boolean = false): ChatClient
            newMainChatClient(this: ZClient): ChatClient
        }
    }

    interface ZClient extends
        Discord.Client, Plugin.Command, Plugin.Task,
        Plugin.Event, Plugin.Message, Plugin.Preference,
        Plugin.PlayerManager, Plugin.GameManager {
    }

    interface Installer {
        install(client: ZClient): void;
    }

    type EchosEvent = Dict<string>;

    interface EchoMessage {
        name?: string;
        id: string;
        cid: string;
        echo?: EchosEvent;
        callbackEvent?: EchosEvent;
    }


    interface InteractionExtend {
        author: Discord.User;
        member: Discord.GuildMember;
    }

    type ZInteraction = Discord.Interaction & InteractionExtend;

    type InteractionMessage = Discord.Message | ZInteraction;

    type BotMessage = Discord.Message;

    interface CrewEventPack {
        cwid: string;
        cmid: string;
        dcid: string;
        members: MembersInfo;
        db_members: ZModel.Game.Players;
        member?: MemberInfo;
        db_member?: ZModel.Game.Player;
        memberRecord?: ZModel.Game.PlayerHistory;
    }

    interface MemoryPercent {
        amount: number;
        amount_mb: string;
        percent?: string;
    }

    interface MemoryInfo {
        total: MemoryPercent;
        usage: MemoryPercent;
        free: MemoryPercent;
    }

    interface ProcessInfo {
        name: string;
        pid: string;
        usage: number;
        percent: string;
    }

    interface CommandArg {
        description?: string;
        permissions?: string[];
        roles?: string[];
        users?: string[];
        cooldown?: number & Dict<number>;
        channels?: string[] & Dict<string[]>;
    }

    type CommandArgs = Dict<CommandArg>;

    interface CommandParam {
        name?: string;
        type?: Discord.ApplicationCommandOptionType;
        description?: string;
    }

    interface CommandSlashData {
        type: Discord.ApplicationCommandType;
        params: CmdParam[];
    }

    interface Executor {
        name?: string;
        bot?: boolean;
        aliases?: string[];
        listens?: string[];
        description?: string;
        args?: CommandArgs;
        permissions?: string[];
        roles?: string[];
        users?: string[];
        cooldown?: number | Dict<number>;
        channels?: string[] | Dict<string[]>;
        once?: boolean;
        interval?: number;
        hide?: boolean;
        type?: string[];
        dbAdmin?: boolean;
        example?: string;
        delete?: boolean;
        slash?: CommandSlashData;
        dm?: boolean;

        execute?(client: ZClient, ...args: any): Promise<void>;
        execute?(client: ZClient, message: InteractionMessage, args?: string[], ...args: any): Promise<void>;
    }

    interface DrugNotifyExecutor extends Executor {
        currentDate?: Moment;
        lastDrugTime?: Moment;
        drugDays?: number;
        drugFlag?: boolean;
    }

    interface AutoSendCrystalExecutor extends Executor {
        currentDate?: Moment;
        lastRewardDate?: Moment;
    }

    interface AutoSendAnyCrystalExecutor extends Executor {
        anyCrewData?: ZModel.Game.AnyCrewDatas;
    }

    interface WeekRewardExecutor extends Executor {
        currentDate?: Moment;
        lastRewardDate?: Moment;
    }

    interface GenshinChecker extends Executor {
        currentDate?: Moment;
        lastHoyolabSignTime?: Moment;
        lastGenshinSignTime: Moment,
    }

    type ReactionOption = Discord.ReactionCollectorOptions

    interface MessageOption extends Discord.MessageCollectorOptions {
        end?(collected: Discord.Collection<string, Discord.Message<boolean>>): Promise<void>;
    }

    namespace Game {
        interface ChatContent {
            cnid: string; // 頻道名稱
            ctid: string; // 訊息id(? - 8位hash)
            cmtype: number; // 訊息類型
            name?: string; // 名字
            ct?: string; // 內容
            pidx: number; // 頭像
            uc: number; // 階級
            ut: number; // 獎盃
            t: string; // 發送時間
            cc: number; // 爆傷
            a: number; // (? - 目前只有看到0)
        }

        interface PublishedMessage {
            channel: string;
            content: string;
        }

        interface MailInfo {
            crew?: boolean; // 是否為團隊獎勵
            ec?: boolean; // 是否過期
            f?: string;
            hide?: boolean;
            ra?: number; // 數量
            rc?: boolean; // 是否接收
            ri?: number; // 物品id
            rt?: number; // 類型 -> 金幣: 0, 寶石: 1, 
            t?: string;
            ten?: string;
            texp?: string;
            tkr?: string;
        }

        interface MemberFullInfo {
            crewid: string;
            id: string;
            dcid?: string;
            data: MemberInfo;
            ban?: string;
            report?: number;
        }

        interface MemberInfo {
            Auth?: number;
            Critical?: number;
            Level?: number;
            LoginDate?: string;
            Name?: string;
            Profile?: number;
            Season?: number;
            SignUpDate?: string;
            Trophy?: number;
        }

        type MembersInfo = Dict<MemberInfo>;

        interface Crew {
            Name?: string;
            Num?: number;
            Exp?: number;
            Tag?: string;
            IsOpen?: boolean;
        }

        interface CrewMembersInfo {
            SubscribeList?: MembersInfo;
            SignUpList?: MembersInfo;
            BlackList?: MembersInfo;
        }

        interface CombineRaidScore {
            PID: string;
            Score: number;
            Stage: number;
            Time: string;
        }

        interface RaidScore {
            Score: number;
            Stage: number;
            Time: string;
        }

        type RaidScores = Dict<RaidScore>;

        interface PersonalRaidRecord {
            Critical: number;
            Name: string;
            Profile: number;
            Score?: RaidScores;
            Trophy: number;
        }

        type CrewRaidRecord = Dict<PersonalRaidRecord>;

        interface PersonalRaidStageDice {
            Id: number;
            Special?: number;
            Upgrade: number;
            UpgradeMat: number;
        }

        interface PersonalRaidStageRecord {
            CID: string;
            Card: number;
            Critical: number;
            Crystal: number;
            CurrentTime: string;
            DiceDeckNum: PersonalRaidStageDice[];
            MaxTrophy: number;
            MaxWave: number;
            MaxWaveHard: number;
            Name: string;
            PID: string;
            PlayCount: number;
            PlayDays: number;
            PlayTime: number;
            Score: number;
            Skin: number;
            Stage: number;
            Trophy: number;
            Version: string;
            PID: string;
            isGoldenPassKey: string; // True, False
        }

        interface DeckDiceInfo {
            Id: number;
            Special: number;
            Upgrade: number;
            UpgradeMat: number;
        }

        interface ProfileData {
            ID?: string;
            CrewInfo?: Team;
            CriticalDamage: number;
            DiceInfoList: DeckDiceInfo[];
            Lose: number;
            Name: string;
            Profile: number;
            SkinIndex: number;
            SkinLevel: number;
            ThemeIndex: number;
            Trophy: number;
            Win: number;
        }

        interface AccountMappingData {
            account: Discord.GuildMember;
            bindings: ProfileData[];
        }

        interface EventQuest {
            et: string;
            qc: number;
            rc: number;
            rt: number;
            rv: number;
            t: number;
            tc: number;
        }

        interface Maintenance {
            msg: string;
            stat: boolean;
        }

        interface NewNotice {
            FileName: string;
        }

        interface Notice {
            img: string;
            url: string;
        }

        interface BaseInfo {
            buffDiceCode: number;
            channel: boolean;
            checkAbusing: boolean;
            checkFps: boolean;
            double: number;
            eventQuest: EventQuest;
            eventTime: string;
            faq: string;
            giftCode: number;
            iap: boolean;
            mails: string;
            maintenance: Maintenance;
            newNotice: NewNotice[];
            notice: Notice;
            pointCode: number;
            solo: number;
            treasureBoxCode: number;
            useIAReviewIOS: boolean;
            vAOS: string;
            vIOS: string;
            vReview: string;
            xmasEvent: boolean;
        }
    }

    namespace ZDB {
        interface Client extends MongoClient {
            connect2DB(): Promise<Client>;
            closeDB(): Promise<void>;
        }

        interface Database {
            DB_URI: string;
            svr: Client;
        }

        interface DBManager {
            db: Database;
            xdb: Database;

            connectAll(): Promise<any>;
            closeAll(): Promise<any>;
        }
    }

    namespace Music {
        type RepeatStatus = "queue" | "none" | "track";
    }

    namespace Steam {
        interface AppInfo {
            appid: string;
            name: string;
        }

        interface AppList {
            applist: {
                apps: AppInfo[];
            };
        }

        interface AppDetail {
            success: boolean;
            data?: {
                price_overview?: {
                    currency: string;
                    initial: number;
                    final: number;
                    discount_percent: number;
                    initial_formatted: string;
                    final_formatted: string; // Free, 免費
                };
            };
        }
    }

    namespace ZModel {
        namespace Game {
            interface Player {
                name: string;
            }

            interface PlayerHistory {
                names: string[];
                nameHistory: string[];
                joinHistory: number[];
            }

            type Players = Dict<Player>;

            type PlayersHistory = Dict<PlayerHistory>;

            interface CrewInfo extends WithId<Document> {
                members?: Players;
                membersRecord?: PlayersHistory;
            }

            interface AnyCrewData extends WithId<Document> {
                cwid: string;
                lastCrewRewardTime?: number;
                rewarded?: boolean;
                autoaccept?: boolean;
            }

            type AnyCrewDatas = Dict<AnyCrewData>;

            interface CrewRaidStageTopData {
                win: number;
                lost: number;
                used: number;
                rate: number;
                team: string;
                avgt: number;
                avgs: number;
                tops: number;
            }

            interface CrystalSettings {
                min: number;
                max: number;
            }

            type CrystalSettingsCollection = Dict<CrystalSettings>;
        }

        namespace Discord {
            interface AccountData extends WithId<Document> {
                userId?: string;
                score?: number;
                weekScore?: number;
                rank?: number;
                status?: number;
                adminPerm?: boolean;
                gameUserId?: string;
            }

            interface BindData extends WithId<Document> {
                userId?: string;
                accounts?: string[];
            }

            type BindDataCollection = Dict<BindData>;

            interface BlackList extends WithId<Document> {
                blackList?: Dict<boolean>;
            }

            interface DataInfo extends WithId<Document> {
                lastRewardTime?: number;
                drugDays?: number;
                drugTime?: number;
                drugFlag?: boolean;
                crewCrystal: ZModel.Game.CrystalSettingsCollection;
            }

            interface LoginData extends WithId<Document> {
                userId?: string;
                image?: string;
                isLogin?: boolean;
            }
        }

        namespace Music {
            interface Cache extends WithId<Document> {
                guildId?: string;
                voiceChannel?: string;
                textChannel?: string;
                musics?: kazagumo.KazagumoTrack[];
                repeatStatus?: Music.RepeatStatus;
            }
        }

        namespace Steam {
            interface FreeDetail extends WithId<Document> {
                appid: string;
                lastUpdatedTime: number;
                isFree: boolean;
            }
        }

        namespace Genshin {
            interface CookieData extends WithId<Document> {
                userId: string;
                cookie: string;
                uids: string[];
            }

            interface AccountData extends WithId<Document> {
                userId: string;
                uid: string;
                hoyolabLastSign?: number;
                genshinLastSign?: number;
            }
        }
    }

    namespace XModel {
        namespace Discord {
            interface LotteryData {
                userID?: string;
                serverID?: string;
                uniqueID?: string;
                lottery?: [];
                state?: number;
            }

            interface ProfileInfo extends WithId<Document> {
                uniqueID?: string;
                serverID?: string;
                userID?: string;
                bank?: number;
                coins?: number;
                guards?: number;
                XP?: number;
                totalXP?: number;
                Level?: number;
            }
        }
    }

    namespace Genshin {
        interface Response {
            message: string;
            retcode: number;
            data?: any;
        }

        interface RealTimeNotesData {
            current_resin: number;
            max_resin: number;
            current_home_coin: number;
            max_home_coin: number;
        }

        interface RealTimeNotesResponse extends Response {
            data?: RealTimeNotesData;
        }

        interface GameAccount {
            game_biz: string;
            region: string;
            game_uid: string;
            nickname: string;
            level: number;
            is_chosen: boolean;
            region_name: string;
            is_official: boolean;
        } 

        interface GameAccountsResponse extends Response {
            data?: {
                list: GameAccount[];
            };
        } 
    }
}
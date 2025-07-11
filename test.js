import { createPlugin } from "@vendetta/metro";
import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

const { FormRow, FormSection } = Forms;
const { createChannel } = findByProps("createChannel");

export default createPlugin({
    name: "MultiChannelCreator",
    description: "Adds a command to create multiple channels at once",
    authors: [{
        name: "YourName",
        id: "YOUR_ID"
    }],
    commands: [{
        name: "createchannel",
        displayName: "createchannel",
        description: "Create multiple channels at once",
        options: [{
            name: "name",
            displayName: "name",
            description: "Base name for the channels",
            required: true,
            type: 3 // STRING
        }, {
            name: "count",
            displayName: "count",
            description: "Number of channels to create",
            required: true,
            type: 4 // INTEGER
        }],
        execute: async (args, ctx) => {
            const channelName = args[0].value;
            const channelCount = args[1].value;
            const guildId = ctx.channel.guild_id;

            if (!guildId) {
                return {
                    content: "This command can only be used in a server!"
                };
            }

            // Check permissions (MANAGE_CHANNELS permission)
            const permissions = findByProps("getCurrentUserPermissions").getCurrentUserPermissions(ctx.channel);
            if (!(permissions & 0x00000010)) { // 0x10 is MANAGE_CHANNELS
                return {
                    content: "You don't have permission to create channels!"
                };
            }

            if (channelCount > 50) {
                return {
                    content: "You can't create more than 50 channels at once!"
                };
            }

            try {
                for (let i = 1; i <= channelCount; i++) {
                    const name = channelCount === 1 ? channelName : `${channelName}-${i}`;
                    await createChannel(guildId, {
                        name,
                        type: 0 // TEXT_CHANNEL
                    });
                }

                return {
                    content: `Successfully created ${channelCount} channel(s)!`
                };
            } catch (e) {
                console.error("Failed to create channels:", e);
                return {
                    content: "Failed to create channels. Check console for details."
                };
            }
        }
    }],
    onLoad() {
        // Patch the command list to show our command
        const patches = [];
        const commandList = findByProps("getBuiltInCommands");
        
        patches.push(after("getBuiltInCommands", commandList, (_, res) => {
            return [...res, this.commands[0]];
        }));

        return () => patches.forEach(p => p());
    },
    onUnload() {
        // Cleanup when plugin is unloaded
    }
});

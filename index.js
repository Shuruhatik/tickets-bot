import Eris from "eris";
import Database from "st.db"
const counts_db = new Database({ path: "count" })
import config from "./config.js"
import SyncCommands from "./SyncCommands.js";
import { ModalBuilder, ModalField } from "discord-modal"
const bot = new Eris(config["TOKEN"], {
    intents: 32509
})
function isEmoji(str) {
    return str.match(/<a?:[a-zA-Z0-9_]+:[0-9]+>/)
}
function isEmojiAnimated(str){
    return str.split(":")[0].split("")[1] == "a" ? true : false
}
bot.on("error", console.log)
bot.on("ready", async () => {
    console.log("Bot is Ready!")
    await SyncCommands(bot)
})

bot.on("interactionCreate", async (interaction) => {
    if (interaction.type == 5) {
        if (interaction.data.custom_id.startsWith("closeticket")) {
            await interaction.createMessage({
                embeds: [{
                    description: `☑️ تم قفل التذكرة بواسطة <@!${interaction.member.id}>`,
                    fields: [{ name: "السبب", value: `\`\`\`${interaction.data.components[0].components[0].value}\`\`\`` }],
                    color: 0xdfb21f
                }]
            }).catch(() => { });
            await bot.editChannelPermission(interaction.channel.id, interaction.member.id, 0n, 3072n, 1)
            await bot.editChannel(interaction.channel.id, { name: `closed-${interaction.channel.name.split("-")[1]}` })
            await bot.createMessage(interaction.channel.id, {
                embeds: [
                    {
                        description: `\`\`\`ضوابط فريق الدعم\`\`\``,
                        color: 0x2B2E30
                    }
                ],
                components: [{
                    type: 1, components: [{
                        type: 2,
                        emoji: { name: "📑" },
                        style: 2,
                        custom_id: `transcriptticket_${interaction.data.custom_id.split("_").slice(1).join("_")}`
                    }, {
                        type: 2,
                        emoji: { name: "🔓" },
                        style: 2,
                        custom_id: `openticket_${interaction.data.custom_id.split("_").slice(1).join("_")}`
                    }, {
                        type: 2,
                        emoji: { name: "🗑️" },
                        style: 2,
                        custom_id: `deleteticket_${interaction.data.custom_id.split("_").slice(1).join("_")}`
                    }]
                }]
            })
            await bot.createMessage(interaction.data.custom_id.split("_")[4], {
                embeds: [{
                    title: "تم قفل التذكرة",
                    description: `تم قفل التذكرة بواسطة <@!${interaction.member.id}>`,
                    fields: [{ name: "التذكرة", value: `<#${interaction.data.custom_id.split("_")[2]}>` }, { name: "السبب", value: `\`\`\`${interaction.data.components[0].components[0].value}\`\`\`` }, { name: "نوع التذاكر", value: `\`\`\`${interaction.data.custom_id.split("_")[3].replaceAll("-", " ")}\`\`\`` }, { name: "تذكرة بواسطة", value: `<@!${interaction.data.custom_id.split("_")[1]}>` }],
                    color: 0xdfb21f,
                    timestamp: new Date()
                }]
            })
        }
    }
    if (interaction.type == 3) {
        if (interaction.data.custom_id.startsWith("transcriptticket")) {
            if(!interaction.member.roles.some(x => x == interaction.data.custom_id.split("_")[5])) return await interaction.createMessage({
                flags: 64,
                content: "فقط طاقم الدعم فني يستطيع القيام بهذا الاجراء :x:"
            })
            await interaction.defer()
            let msgs = await bot.getMessages(interaction.channel.id, { limit: 500 })
            await interaction.createFollowup({
                embeds: [{
                    title: "تم تحويل التذكرة إلى المحادثة",
                    description: `تم تحويل التذكرة إلى المحادثة بواسطة <@!${interaction.member.id}>`,
                    color: 0xdfb21f,
                    timestamp: new Date()
                }]
            }, {
              file: msgs.reverse().filter(x => x.content).map(x => `${x.author.username}: ${x.content}`).join("\n"),
              name: "transcript.txt"
            })
        }
        if (interaction.data.custom_id.startsWith("deleteticket")) {
            if(!interaction.member.roles.some(x => x == interaction.data.custom_id.split("_")[5])) return await interaction.createMessage({
                flags: 64,
                content: "فقط طاقم الدعم فني يستطيع القيام بهذا الاجراء :x:"
            })
            await interaction.createMessage({ flags: 64, content: "جاري تنفيذ طلبك" })
            let msgs = await bot.getMessages(interaction.channel.id, { limit: 500 })
            setTimeout(async () => {
                await bot.deleteChannel(interaction.data.custom_id.split("_")[2])
                await bot.createMessage(interaction.data.custom_id.split("_")[4], {
                    embeds: [{
                        title: "تم حذف التذكرة",
                        description: `تم حذف التذكرة بواسطة <@!${interaction.member.id}>`,
                        fields: [{ name: "التذكرة", value: `${interaction.data.custom_id.split("_")[2]}` }, { name: "نوع التذاكر", value: `\`\`\`${interaction.data.custom_id.split("_")[3].replaceAll("-", " ")}\`\`\`` }, { name: "تذكرة بواسطة", value: `<@!${interaction.data.custom_id.split("_")[1]}>` }],
                        color: 0xdf1f1f,
                        timestamp: new Date()
                    }]
                }, {
                    file: msgs.reverse().filter(x => x.content).map(x => `${x.author.username}: ${x.content}`).join("\n"),
                    name: "transcript.txt"
                  })
            }, 4000)
        }
        if (interaction.data.custom_id.startsWith("openticket")) {
            if(!interaction.member.roles.some(x => x == interaction.data.custom_id.split("_")[5])) return await interaction.createMessage({
                flags: 64,
                content: "فقط طاقم الدعم فني يستطيع القيام بهذا الاجراء :x:"
            })
            await bot.deleteMessage(interaction.channel.id, interaction.message.id)
            await bot.createMessage(interaction.channel.id, {
                embeds: [{
                    description: `☑️ تم فتح التذكرة بواسطة <@!${interaction.member.id}>`,
                    color: 0x3FB745
                }]
            }).catch(() => { });
            await bot.editChannelPermission(interaction.channel.id, interaction.member.id, 3072n, 0n, 1)
            await bot.editChannel(interaction.channel.id, { name: `ticket-${interaction.channel.name.split("-")[1]}` })
            await bot.createMessage(interaction.data.custom_id.split("_")[4], {
                embeds: [{
                    title: "تم فتح التذكرة",
                    description: `تم فتح التذكرة بواسطة <@!${interaction.member.id}>`,
                    fields: [{ name: "التذكرة", value: `<#${interaction.data.custom_id.split("_")[2]}>` }, { name: "نوع التذاكر", value: `\`\`\`${interaction.data.custom_id.split("_")[3].replaceAll("-", " ")}\`\`\`` }, { name: "تذكرة بواسطة", value: `<@!${interaction.data.custom_id.split("_")[1]}>` }],
                    color: 0x3FB745,
                    timestamp: new Date()
                }]
            })
        }
        if (interaction.data.custom_id.startsWith("closeticket")) {
            if (interaction.data.custom_id.split("_")[1] != interaction.member.id) return await interaction.createMessage({
                flags: 64,
                content: "فقط صاحب تذكرة يستطيع قفل التذكرة من زر هذا :x:"
            })
            let textinput = new ModalBuilder()
                .setCustomId(interaction.data.custom_id)
                .setTitle("استطلاع سبب قفل التذكرة")
                .addComponents(
                    new ModalField()
                        .setLabel("قم بكتابة سبب قفل التذكرة")
                        .setStyle("paragraph")
                        .setCustomId("reason")
                        .setPlaceholder("قم بكتابة سبب او اسباب لقفل تذكرتك")
                        .setRequired(true)
                        .setMin(5)
                        .setMax(1000))
            await bot.createInteractionResponse(interaction.id, interaction.token, { type: 9, data: textinput.toJSON() })
        }
        if (interaction.data.custom_id.startsWith("ticket")) {
            await interaction.createMessage({
                flags: 64,
                content: "في انتظار إنشاء تذكرتك..."
            })
            let count = await counts_db.has(`${interaction.data.custom_id.split("_")[1]}_${interaction.data.custom_id.split("_")[3]}`) ? await counts_db.get(`${interaction.data.custom_id.split("_")[1]}_${interaction.data.custom_id.split("_")[3]}`) : 0
            bot.createChannel(interaction.guildID, `ticket-${count + 1}`, 0, {
                parentID: interaction.data.custom_id.split("_")[3], topic: `Ticket ${interaction.data.custom_id.split("_")[1].replaceAll("-", " ")}\nBy <@!${interaction.member.id}>`,
                permissionOverwrites: [
                    {
                        id: interaction.guildID,
                        allow: 0n,
                        deny: 3072n,
                        type: 0
                    },
                    {
                        id: interaction.data.custom_id.split("_")[2],
                        allow: 3072n,
                        deny: 0n,
                        type: 0
                    },
                    {
                        id: interaction.member.id,
                        allow: 3072n,
                        deny: 0n,
                        type: 1
                    },
                    {
                        id: bot.user.id,
                        allow: 3072n,
                        deny: 0n,
                        type: 1
                    }
                ]
            }).then(async channel => {
                await interaction.editOriginalMessage({
                    flags: 64,
                    content: `☑️ تم إنشاء تذكرتك <#${channel.id}>`,
                })
                await bot.createMessage(interaction.data.custom_id.split("_")[4], {
                    embeds: [{
                        title: "تم إنشاء التذكرة",
                                      description: `تم إنشاء التذكرة بواسطة <@!${interaction.member.id}>`,
                        fields: [{ name: "التذكرة", value: `<#${channel.id}>` }, { name: "نوع التذاكر", value: `\`\`\`${interaction.data.custom_id.split("_")[1].replaceAll("-", " ")}\`\`\`` },{name:"السبب",value:`\`\`\`${interaction.data.custom_id.split("_")[5].replaceAll("-", " ")}\`\`\``}],
                        color: 0x3FB745,
                        timestamp: new Date()
                    }]
                })
                await counts_db.add(`${interaction.data.custom_id.split("_")[1]}_${interaction.data.custom_id.split("_")[3]}`, 1)
                await channel.createMessage({
                    content: `مرحباً بك , <@!${interaction.member.id}>`, embeds: [
                        {
                            title: `${interaction.data.custom_id.split("_")[1].replaceAll("-", " ")}`,
                            description: `شكرا لإنشاء التذكرة. يرجى انتظار فريق الدعم. سوف يستجيبون لك. إذا كنت تريد قفل التذكرة ، فاضغط على الزر 🔒${interaction.data.custom_id.split("_")[5] == true ? "":`\n\`\`\`${interaction.data.custom_id.split("_")[5].replaceAll("-", " ")}\`\`\` `}`,
                            color: 0x3FB745
                        }
                    ],
                    components: [{
                        type: 1, components: [{
                            type: 2,
                            emoji: { name: "🔒" },
                            style: 2,
                            custom_id: `closeticket_${interaction.member.id}_${channel.id}_${interaction.data.custom_id.split("_")[1]}_${interaction.data.custom_id.split("_")[4]}_${interaction.data.custom_id.split("_")[2]}`
                        }]
                    }]
                })
            })
        }
    }
    if (interaction.type == 2) {
        if (interaction.data.name == "setup") {
            if(!interaction.member.permissions.has("administrator")) return await interaction.createMessage({
                flags: 64,
                content: ":x: ليس لديك صلاحيات لهذا"
            })
            await interaction.createMessage({
                flags: 64,
                embeds: [{
                    title: "☑️ تم تنفيذ طلبك بنجاح",
                    color: 0x3FB745
                }]
            })
            let embeds = [{
                title: interaction.data.options[0].value,
                description: interaction.data.options[1].value.replaceAll("<br>","\n"),
                color: 0x3FB745,
                image: {
                    url: interaction.data.options[7] && interaction.data.options[7].value.startsWith("https") ? interaction.data.options[7].value : null
                }
            }]
            let components = []
            interaction.data.options.filter(x => x.name.startsWith("button_name")).forEach((d) => {
                let button = {
                    type: 2,
                    style: +interaction.data.options[4].value,
                    custom_id: `ticket_${interaction.data.options[0].value.replaceAll(" ", "-")}_${interaction.data.options[2].value}_${interaction.data.options[5].value}_${interaction.data.options[6].value}_${isEmoji(d.value) ? true : d.value.replaceAll(" ", "-")}_${Date.now()}`
                }
                if(isEmoji(d.value)){
                    button.emoji = {name:d.value.split(":")[1],id:d.value.split(":")[2].slice(0,-1),animated:isEmojiAnimated(d.value)}
                } else {
                    button.label = d.value
                }
                components.push(button)
            })
            await interaction.channel.createMessage({
                embeds, components: [{ type: 1, components }]
            })
        }
    }
})

bot.connect()

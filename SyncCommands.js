const commands = [{
  type: 1,
  name: "setup",
  description: "تعيين نظام التذاكر",
  options: [{
    name: "name",
    description: "اسم التذاكر",
    required: true,
    type: 3
  }, {
    name: "description",
    description: "وصف التذاكر",
    required: true,
    type: 3
  }, {
    name: "support_role",
    description: "قوم باختيار رتبة المسؤولين",
    required: true,
    type: 8
  }, {
    name: "button_name_1",
    description: "اسم زر التذاكر الاول",
    required: true,
    type: 3
  },
  {
    name: `buttons_color`,
    description: `لون الازرار الذي تريده`,
    required: true,
    choices: [
      {
        name: `Blue`, value: "1"
      },
      {
        name: `Green`, value: "3"
      },
      {
        name: `Gray`, value: "2"
      },
      {
        name: `Red`, value: "4"
      }
    ],
    type: 3,
  }, {
    name: "category",
    description: "كاتورجي للي هيكون فيه رومات التذاكر",
    required: true,
    channel_types: [4],
    type: 7
  }, {
    name: "logs_channel",
    description: "روم سجلات للي هيكون فيه سجلات التذاكر",
    required: true,
    channel_types: [0],
    type: 7
  }, {
    name: "image_url",
    description: "اذا كنت تريد وضح صورة في الرسالة",
    required: false,
    type: 3
  }, {
    name: "button_name_2",
    description: "اسم زر التذاكر الثاني",
    required: false,
    type: 3
  }, {
    name: "button_name_3",
    description: "اسم زر التذاكر الثالث",
    required: false,
    type: 3
  }, {
    name: "button_name_4",
    description: "اسم زر التذاكر الرابع",
    required: false,
    type: 3
  }, {
    name: "button_name_5",
    description: "اسم زر التذاكر الخامس",
    required: false,
    type: 3
  }]
}]

export default async function (bot) {
  let currentCommands = await bot.getCommands() || [];
  let newCommands = commands.filter((cmd) => !currentCommands.some((c) => c.name == cmd.name))
  newCommands.forEach(async (cmd) => {
    await bot.createCommand(cmd)
  })
  let updatedCommands = currentCommands.filter((c) => commands.some((c2) => c2.description != c.description || c2.type != c.type || c2.options != c.options));

  if (updatedCommands.length != 0) {
    updatedCommands.forEach(async (updatedCommand) => {
      let cmdID = updatedCommand.id
      if (commands.find((c) => c.name === updatedCommand.name)) {
        let previousCommand = commands.find((c) => c.name === updatedCommand.name);

        await bot.editCommand(cmdID, previousCommand)
      }
    })
  }

  currentCommands.forEach(async (oldcmd) => {
    if (!commands.some((c) => c.name == oldcmd.name)) {
      await bot.deleteCommand(oldcmd.id)
    }
  })
}
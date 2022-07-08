import fs from 'fs-extra'
import path from 'path'

export default async function(app) {
    const emojiPath = path.join(app.config.path.base, 'node_modules', 'unicode-emoji-json/data-ordered-emoji.json')
    const emoji = await fs.promises.readFile(emojiPath, 'utf8')

    app.get('/api/chat/emoji', function(req, res) {
        res.end(JSON.stringify(emoji))
    })
}

<img height="100" src="../ui/public/logo-text.svg">

# Documentation

1. [Features](./features.md) - An overview of Pyrite's features
2. [Usage](./usage.md) - How to use Pyrite
3. [Development](./development.md) - How to develop Pyrite
4. [Services](./systemd.md) - Systemd setup
5. [Proxy](./proxy.md) - NGINX configuration

![Pyrite screenshot](./pyrite.png "Pyrite")

## FAQ

### What is the purpose of pyrite.video?

This is a service that is solely meant for testing purposes on a small scale.
It is not meant as an attempt to launch another video-conferencing service,
so please setup your own server.

### My browser shows a whitescreen

Try to clear the browser cache and unregister the service worker from devtools.
Pyrite uses a service worker, which sometimes incorrectly caches files.

### Emojis look ugly

Sadly, this is still a system configuration issue, while browsers should come
with their own Emoji font. Checkout this [article](https://nolanlawson.com/2022/04/08/the-struggle-of-using-native-emoji-on-the-web/) for detailed background information
on the issue. Firefox does bundle its own Emoji font (Twemoji), but Chromium doesn't.
To have proper Emoji in Chromium, I had to add a proper system font; e.g. on Archlinux:

```bash
yay -S noto-color-emoji-fontconfig
```

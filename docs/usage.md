
# Admin mode

Open a browser to <http://localhost:3030> and click on the logo
to switch to operator mode. You can find the user passwords
in the settings file:

```bash
cat ~/.pyriterc
```

Create some groups & users. For a quick test, you can fire up a
second Chromium browser with a fake WebRTC device.

# Local testing

```bash
chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features --user-data-dir=/tmp/.chromium-tmp http://localhost:3030
```

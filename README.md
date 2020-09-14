# Grandtotal 6 - Kimai plugin

This is a Grandtotal plugin to import timesheet data from Kimai 2.

## 🎉 DONATE 🎉

> I know it's great to get something for free... but please keep in mind:
> I need to pay bills as well and without [your donations](https://www.paypal.me/kevinpapst) this is impossible.

### How to create a new release

- Delete the ZIP
- ZIP the `Kimai2.grandtotalplugin` directory
- Push the ZIP
- Create a new GitHub release and attach the ZIP

```bash
rm Kimai2.grandtotalplugin.zip
zip -r Kimai2.grandtotalplugin.zip Kimai2.grandtotalplugin -x ".*" -x "__MACOSX" -x "Kimai2.grandtotalplugin.zip" -x ".DS_Store"
git commit -m "Updated release"
git push
```

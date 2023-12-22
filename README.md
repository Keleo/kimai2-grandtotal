# Grandtotal - Kimai importer plugin

This is a Grandtotal plugin to import timesheet data from [Kimai](https://github.com/kimai/kimai) the [open-source time-tracker](https://www.kimai.org/), and it's [cloud based time-tracker](https://www.kimai.cloud) companion.

### How to create a new release

- Delete the ZIP
- ZIP the `Kimai2.grandtotalplugin` directory
- Push the ZIP
- Create a new GitHub release and attach the ZIP

```bash
rm Kimai2.grandtotalplugin.zip
zip -r Kimai2.grandtotalplugin.zip Kimai2.grandtotalplugin -x ".*" -x "__MACOSX" -x "Kimai2.grandtotalplugin.zip" -x ".DS_Store"
git add Kimai2.grandtotalplugin.zip
git commit -m "Updated release"
git push
```

### How to open the JS log in GrandTotal

The console will open automatically if some debug code is included: 
```
log('a message');
```

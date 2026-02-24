# Wedding1 Design Export

This workspace contains a static HTML export of the Figma file:

- `https://www.figma.com/design/8LpPi2bVAky4MRlGNN5LGV/wedding1?node-id=0-1&t=DETIiqKjONZR7uZr-1`

## Structure

- `stitch_home_page_mobile_luxury_wedding/index.html` : gallery index for all screens
- `stitch_home_page_mobile_luxury_wedding/<screen_slug>/code.html` : live HTML implementation
- `stitch_home_page_mobile_luxury_wedding/<screen_slug>/screen.png` : design reference image

## Run locally

From the repo root:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173/stitch_home_page_mobile_luxury_wedding/index.html`

## Notes

- Screens are grouped into Desktop and Mobile in the index page.
- Each screen card includes links to both the rendered page and the PNG reference for quick visual comparison.
# weddings

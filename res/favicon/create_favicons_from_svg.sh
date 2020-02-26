#!/usr/bin/env bash

# Check if inkscape is installed
if ! [ -x "$(command -v inkscape)" ]; then
  echo 'Error: inkscape is not installed. https://inkscape.org/release' >&2
  exit 1
fi

# Check if magick is installed
if ! [ -x "$(command -v magick)" ]; then
  echo 'Error: image magick is not installed. https://www.imagemagick.org/script/download.php' >&2
  exit 1
fi

# PNG export: Declare an array with the image sizes
array=( 16 48 128 180 196 256 512 )
for i in "${array[@]}"
do
	# Export each size as a `png` favicon from `favicon.svg`
	inkscape "favicon.svg" --export-filename="favicon_"$i".png" --export-width=$PNG_SIZE --export-height=$PNG_SIZE
done

# ICO export:
magick convert favicon_512.png -define icon:auto-resize=16,32,48,64,96,128,256 favicon.ico

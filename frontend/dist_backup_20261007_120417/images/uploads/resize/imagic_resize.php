<?php
/**
 * ImageMagick image resizer
 * Marcin K.
 */
header("Location: /error");
ini_set('display_errors', false);
error_reporting(E_ALL);
 
/*
 * Setup inital resolution and read image dimensions
 */
$initResolution = 100;
// $initResolution = 10000;
$maxImagePixels = 10000000; // widht * height


/*
 * Build file name and path
 */
$imageFile = pathinfo($_GET['image'], PATHINFO_BASENAME);
$file = array(pathinfo($_GET['image'], PATHINFO_FILENAME), pathinfo($_GET['image'], PATHINFO_EXTENSION));
$path = pathinfo($_GET['image'], PATHINFO_DIRNAME).'/';
$path_name = NULL;

//
// Make sure we're not upsampling jpg or png images
//
if( !isset($_GET['enlarge']) )
{
	$_GET['enlarge'] = 0;
}

if( $_GET['enlarge'] == 0 )
{
	$imageGeometry = array();
	if( file_exists('../' . $path . $imageFile) )
	{
		$image = new Imagick('../' . $path . $imageFile);
		$imageGeometry = $image->getImageGeometry(); 
	}
}

if( @$_GET['width'] > 0 )
{
	if( !empty($imageGeometry['width']) and @$_GET['width'] > $imageGeometry['width'] )
	{
		$maxWidth = $imageGeometry['width'];
	}
	else
	{
		$maxWidth = $_GET['width'];
	}	
}
if( @$_GET['height'] > 0 )
{
	if( !empty($imageGeometry['height']) and @$_GET['height'] > $imageGeometry['height'] )
	{
		$maxHeight = $imageGeometry['height'];
	}
	else
	{
		$maxHeight = $_GET['height'];
	}
}

//
// This is helpfull for CSS cropping
// We have to come up with true cropping
//
$imageGeometryRatio = $imageGeometry['width']/$imageGeometry['height'];
$boxRatio = $maxWidth/$maxHeight;

if( !empty($imageGeometry) and isset($_GET['crop']) )
{

	if( $imageGeometryRatio > $boxRatio )
	{
		$maxWidth = null;
	}
	elseif( $imageGeometryRatio < $boxRatio )
	{
		$maxHeight = null;	
	}
}

/*
 * Check and set dimensions
 */
if(empty($maxWidth))
{
	$maxWidth = 10000;
}

if(empty($maxHeight))
{
	$maxHeight = 10000;
}

if(empty($maxHeight) and empty($maxWidth))
{
	header("HTTP/1.0 404 Not Found");
	die('Invalid height or width specified.');
}

// ini_set("display_errors", true);


if( !empty($path) )
{
	$path_name = str_replace('/', '_', $path);
}

$file[0] =  html_entity_decode(stripslashes($file[0]));

/*
 * Check for extensions
 */
if(isset($_GET['out_ext']) AND !empty($_GET['out_ext']))
{
	$outputFormat = strtolower($_GET['out_ext']);
}
else
{
	$outputFormat = 'png';
}
// die(print_r($path, true));

/* Verify that the desired source, exists, and try fallback options */
// die(print_r($file, true));
// die(print_r('../'.$path.$file[0].'.'.$file[1], true));
if(file_exists('../'.$path.$file[0].'.'.$file[1]))
{
	// die('yay');
}
elseif(file_exists('../'.$path.$file[0].'.eps'))
{
	$file[1] = 'eps';
}
elseif(file_exists('../'.$path.$file[0].'.tif'))
{
	$file[1] = 'tif';
}
elseif(file_exists('../'.$path.$file[0].'.jpg'))
{
	$file[1] = 'jpg';
}
elseif(file_exists('../'.$path.$file[0].'.JPG'))
{
	$file[1] = 'JPG';
}
elseif(file_exists('../'.$path.$file[0].'.png'))
{
	$file[1] = 'png';
}
elseif(file_exists('../'.$path.$file[0].'.PNG'))
{
	$file[1] = 'PNG';
}
else //file doesn't exist, return 404
{
	header('HTTP/1.0 404 Not Found');
	?>Error 404 - Unable to find the specified image.<?php
	die();
}

$imageFile = $file[0].'.'.$file[1];
$_GET['image'] = $path.$file[0].'.'.$file[1];
$sourceImage = '../'.$path.$file[0].'.'.$file[1]; //the source file to be opened
$cacheImage = '../cache/'.str_replace(array('../', '/', ' ', '%20'), array('', '_', '_', '_'), $path).str_replace(array('../', '/', ' ', '%20'), array('', '_', '_', '_'), $file[0]).'_'.filesize($sourceImage).'_'.$maxWidth.'_'.$maxHeight.'.'.$outputFormat; //the file name for the cache image
/**/
// die($cacheImage);


/*
 * Check if we have the file in the cache
 */
if(!file_exists($cacheImage)) //if the cache image doesn't exist, generate the cached image
{
	$image = new Imagick();
	$image->setResolution($initResolution, $initResolution);
	$image->readImage('../'.$path.$imageFile);
	$image->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
	
	$imageWidth = $image->getImageWidth();
	$imageHeight = $image->getImageHeight();

	$image->clear();
	$image->destroy();

	$imageRatio = $imageWidth / $imageHeight; // if > 1 than width is bigger, if < 0 then hight is bigger
	$boxRatio = $maxWidth / $maxHeight; // if > 1 than width is bigger, if < 0 then hight is bigger

	if($imageRatio > 1)
	{
		if($imageRatio > $boxRatio)
		{
			$newRes = (($maxWidth * $initResolution) / $imageWidth);
		}
		else
		{
			$newRes = (($maxHeight * $initResolution) / $imageHeight);
		}
	}
	elseif($imageRatio < 1)
	{
		if($imageRatio < $boxRatio)
		{
			$newRes = (($maxHeight * $initResolution) / $imageHeight);
		}
		else
		{
			$newRes = (($maxWidth * $initResolution) / $imageWidth);
		}
	}
	else
	{
		if($boxRatio > 1)
		{
			$newRes = (($maxHeight * $initResolution) / $imageHeight);
		}
		else
		{
			$newRes = (($maxWidth * $initResolution) / $imageWidth);
		}
	}
	
	/*
	 * Before doing anything let's check image pixel count.
	 * We can set it to high otherwise server will go nuts!!!
	 */
	$pixelCount = round((($newRes / $initResolution) * $imageWidth) * (($newRes / $initResolution) * $imageHeight));
	if($pixelCount >= $maxImagePixels)
	{
		die('Pixel count to high ('.$pixelCount.'). Max value is set to: '.$maxImagePixels);
	}
	
	/*
	 * Decided to use imagemagick's convert command
	 * because transparency wasn't working properly with imagick API
	 */

	if($file[1] == 'eps') //if eps, set image density
	{
		$density = '-channel RGBA -colorspace RGB -density '.$newRes.'x'.$newRes;
		$results = system('convert '.$density.' "../'.$_GET['image'].'" -quality 100 "'.$cacheImage.'"');
		$density = '-channel RGBA -colorspace CMYK';
		$results = system('convert '.$density.' "'.$cacheImage.'" -profile USWebCoatedSWOP.icc -profile AdobeRGB1998.icc -resize '.$maxWidth.'x'.$maxHeight.' -quality 92 "'.$cacheImage.'"');
	}
	else
	{
		$imageArray = explode('/', $_GET['image']);
		$folder = $imageArray[2];
		$imageArray = array_reverse($imageArray);
		$image = $imageArray[0];
		
		$watermark = '';
		/* if watermark is turned on, add it */
		// if(@$_GET['watermark'] and @$_GET['width'] > 350)
		// {
			// $wmText = chr(169).' '.date('Y');
			// try
			// {
				// $soap = new SoapClient('http://www.teambasementsystems.com/portal/api/imageCompanyInfo/imageCompanyInfo.wsdl');
				// $companyData = $soap->getImageCompanyInfo($folder, $image);
				// $wmText .= ' '.$companyData['company_token'];
				
			// }
			// catch(Exception $e){}
			// if($companyData)
			// {
				// $watermark = '-gravity southeast -stroke "#000C" -strokewidth 2 -annotate 0 "'.$wmText.'" -stroke none -fill white -annotate 0 "'.$wmText.'"';
			// }
		// }

		//$density = '';
		$results = system('convert "../'.$_GET['image'].'" -resize '.$maxWidth.'x'.$maxHeight.' -quality 92 '.$watermark.' "'.$cacheImage.'"');
	}
	
}

/*
 * Set the headers
 * Load the image and display it
 */

header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($cacheImage)).' GMT');

if(isset($_GET['no_cache']) and $_GET['no_cache'])
{
	header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
	header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
}
else
{
	header('Expires: '.gmdate('D, d M Y H:i:s', filemtime($cacheImage) + (60*60*24*30)).' GMT');
}

if(@$_SERVER['HTTP_IF_MODIFIED_SINCE'] and strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) >= filemtime($cacheImage) )
{
	header('HTTP/1.1 304 Not Modified');
}

if($outputFormat == 'jpg')
{
	header('Content-type: image/jpeg');
}
elseif($outputFormat == 'jpeg')
{
	header('Content-type: image/jpeg');
}
elseif($outputFormat == 'png')
{
	header('Content-type: image/png');
}
elseif($outputFormat == 'gif')
{
	header('Content-type: image/gif');
}
elseif($outputFormat == 'tif')
{
	header('Content-type: image/tiff');
}
echo(file_get_contents($cacheImage));
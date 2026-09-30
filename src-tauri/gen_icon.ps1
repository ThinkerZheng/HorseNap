# 生成占位应用图标 icon.png（512x512，深蓝圆角 + 白色睡马剪影 + Zzz）
Add-Type -AssemblyName System.Drawing
$size = 512
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.Clear([System.Drawing.Color]::Transparent)

# 圆角背景（垂直渐变 深蓝 -> 靓蓝）
$rect = [System.Drawing.Rectangle]::new(0, 0, $size, $size)
$col1 = [System.Drawing.Color]::FromArgb(255, 13, 21, 38)
$col2 = [System.Drawing.Color]::FromArgb(255, 34, 56, 96)
$mode = [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $col1, $col2, $mode)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$r = 110
$path.AddArc($r, $r, 2*$r, 2*$r, 180, 90) | Out-Null
$path.AddArc($size-$r, $r, 2*$r, 2*$r, 270, 90) | Out-Null
$path.AddArc($size-$r, $size-$r, 2*$r, 2*$r, 0, 90) | Out-Null
$path.AddArc($r, $size-$r, 2*$r, 2*$r, 90, 90) | Out-Null
$path.CloseFigure()
$g.FillPath($brush, $path)

# 白色马头（简化：身体椭圆 + 颈/头多边形 + 耳朵）
$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,247,247,251))
$g.FillEllipse($white, 120, 250, 260, 130) | Out-Null   # 身体
$headPts = @(
  [System.Drawing.PointF]::new(300,270),
  [System.Drawing.PointF]::new(360,180),
  [System.Drawing.PointF]::new(400,210),
  [System.Drawing.PointF]::new(390,300),
  [System.Drawing.PointF]::new(320,320)
)
$g.FillPolygon($white, $headPts) | Out-Null
# 耳朵
$ear1 = @([System.Drawing.PointF]::new(356,182),[System.Drawing.PointF]::new(352,140),[System.Drawing.PointF]::new(384,172))
$ear2 = @([System.Drawing.PointF]::new(388,186),[System.Drawing.PointF]::new(404,150),[System.Drawing.PointF]::new(410,192))
$g.FillPolygon($white, $ear1) | Out-Null
$g.FillPolygon($white, $ear2) | Out-Null
# 鬃毛（淡蓝紫）
$mane = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,185,199,238))
$manePts = @([System.Drawing.PointF]::new(320,300),[System.Drawing.PointF]::new(300,220),[System.Drawing.PointF]::new(336,236),[System.Drawing.PointF]::new(340,300))
$g.FillPolygon($mane, $manePts) | Out-Null
# 闭眼（弧线）
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255,90,90,114)), 6
$g.DrawArc($pen, 344, 236, 34, 24, 20, 140) | Out-Null

# Zzz
$font = New-Object System.Drawing.Font ('Segoe UI', 52, [System.Drawing.FontStyle]::Bold)
$zbrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220,159,176,208))
$g.DrawString('Z', $font, $zbrush, 150, 120) | Out-Null
$g.DrawString('z', $font, $zbrush, 200, 80) | Out-Null
$font2 = New-Object System.Drawing.Font ('Segoe UI', 34, [System.Drawing.FontStyle]::Bold)
$g.DrawString('z', $font2, $zbrush, 240, 56) | Out-Null

$outDir = Join-Path $PSScriptRoot 'icons'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
$out = Join-Path $outDir 'icon.png'
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "WROTE $out"

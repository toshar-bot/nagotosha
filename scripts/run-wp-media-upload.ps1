param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$ImageDirectory
)

$ErrorActionPreference = "Stop"

$requiredNames = @(
  "WORDPRESS_API_BASE",
  "WORDPRESS_USERNAME",
  "WORDPRESS_APP_PASSWORD"
)

function Get-StateLabel {
  param([string]$Name)
  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($Name, "Process"))) {
    return "missing"
  }
  return "set"
}

function Show-EnvStates {
  foreach ($name in $requiredNames) {
    [pscustomobject]@{
      Name = $name
      State = Get-StateLabel -Name $name
    }
  }
}

function Read-RequiredValue {
  param(
    [string]$Name,
    [string]$Prompt,
    [string]$DefaultValue
  )

  $current = [Environment]::GetEnvironmentVariable($Name, "Process")
  if (-not [string]::IsNullOrWhiteSpace($current)) {
    return
  }

  if ([string]::IsNullOrWhiteSpace($DefaultValue)) {
    $value = Read-Host $Prompt
  } else {
    $value = Read-Host "$Prompt [$DefaultValue]"
    if ([string]::IsNullOrWhiteSpace($value)) {
      $value = $DefaultValue
    }
  }

  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "$Name is required."
  }

  [Environment]::SetEnvironmentVariable($Name, $value, "Process")
}

function Read-RequiredSecret {
  param(
    [string]$Name,
    [string]$Prompt
  )

  $current = [Environment]::GetEnvironmentVariable($Name, "Process")
  if (-not [string]::IsNullOrWhiteSpace($current)) {
    return
  }

  $secure = Read-Host $Prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $value = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }

  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "$Name is required."
  }

  [Environment]::SetEnvironmentVariable($Name, $value, "Process")
}

$resolvedImageDirectory = Resolve-Path -LiteralPath $ImageDirectory
$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$uploadScript = Join-Path $repoRoot "scripts\wp-upload-media.mjs"

if (-not (Test-Path -LiteralPath $uploadScript)) {
  throw "Upload script not found: $uploadScript"
}

Write-Host "WordPress media upload wrapper"
Write-Host "Credentials are used only in this PowerShell process and are not saved."
Write-Host "Current environment state:"
Show-EnvStates | Format-Table -AutoSize

Read-RequiredValue -Name "WORDPRESS_API_BASE" -Prompt "WORDPRESS_API_BASE" -DefaultValue "https://nagotosha.com/wp-json/wp/v2"
Read-RequiredValue -Name "WORDPRESS_USERNAME" -Prompt "WORDPRESS_USERNAME" -DefaultValue ""
Read-RequiredSecret -Name "WORDPRESS_APP_PASSWORD" -Prompt "WORDPRESS_APP_PASSWORD"

Write-Host "Environment state before upload:"
Show-EnvStates | Format-Table -AutoSize

Push-Location $repoRoot
try {
  & node $uploadScript $resolvedImageDirectory.Path
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}

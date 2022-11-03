param($version, $suffix, $env = 'release', [switch]$push = $false)

$versionString = $version
if (![string]::IsNullOrWhiteSpace($suffix)) 
{
    $versionString = -join($version, '-', $suffix)
}
$outfolder = ".\$versionString"

"### Restore"; ""
dotnet restore ../TranslationManager.ContentBlocks.sln -v m

"### Pack"; ""
dotnet pack ..\Jumoo.TranslationManager.ContentBlocks\Jumoo.TranslationManager.ContentBlocks.csproj -c $env -o $outFolder /p:ContinuousIntegrationBuild=true,version=$versionString -v q

"### To Local Git"; ""
XCOPY "$outFolder\*.nupkg" "c:\source\localgit" /q /y 

if ($push) {
    "### Push"; ""
    .\nuget.exe push "$outFolder\*.nupkg" -ApiKey AzureDevOps -src https://pkgs.dev.azure.com/jumoo/Public/_packaging/nightly/nuget/v3/index.json
}
"" ; "# Done [$versionString] packed"; ""
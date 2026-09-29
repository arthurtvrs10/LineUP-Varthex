# Rebuild the local tutorial with PowerShell 7 (no downloaded dependencies).
$guidePath = Join-Path $PSScriptRoot '../05-api-integracoes/guia-configuracao.md'
$html = (ConvertFrom-Markdown -LiteralPath $guidePath).Html
$sections = [regex]::Split($html, '(?=<h2(?:\s|>))')
$navigation = ''
$body = $sections[0]
for ($i = 1; $i -lt $sections.Length; $i++) {
    $heading = [regex]::Match($sections[$i], '<h2[^>]*>(.*?)</h2>').Groups[1].Value
    $navigation += "<a href=`"#guia-$i`">$heading</a>"
    $body += "<section id=`"guia-$i`" tabindex=`"-1`">$($sections[$i])</section>"
}
$body = $body.Replace('<table>', '<div class="table-wrap"><table>').Replace('</table>', '</table></div>')
$index = Get-Content (Join-Path $PSScriptRoot 'index.html') -Raw
$header = [regex]::Match($index, '<header class="header">.*?</header>').Value
$page = @"
<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Integrações — LineUp Docs local</title><link rel="stylesheet" href="style.css"><script src="app.js" defer></script></head>
<body><a class="skip" href="#conteudo">Pular para o conteúdo</a>$header
<div class="layout"><aside class="sidebar" id="navegacao"><p><a href="index.html">← Infraestrutura</a></p><label for="search">Buscar neste guia</label><input id="search" type="search" placeholder="Resend, Google, credenciais…"><div id="search-status" class="status" aria-live="polite"></div><nav aria-label="Integrações">$navigation</nav></aside><main id="conteudo" tabindex="-1">$body</main><aside class="toc"><p>DOCUMENTO INTERNO</p><p>Somente local · 28/09/2026</p></aside></div></body></html>
"@
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'integracoes.html'), $page)

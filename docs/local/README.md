# LineUp Docs — somente local

Abra `index.html` diretamente no navegador ou execute, na raiz do projeto:

```powershell
node docs/local/serve.mjs
```

Acesse http://127.0.0.1:4178. Encerre com Ctrl+C.

O servidor escuta apenas em 127.0.0.1, aceita somente os arquivos explicitamente permitidos da documentação e não expõe o repositório. Não usa pacotes externos. A página funciona sem internet; os links de fontes abrem sites externos somente ao clicar.

O [tutorial de integrações](integracoes.html) cobre Resend, login Google, WhatsApp, infraestrutura e o estado previsto do Google Calendar. Sua fonte é `docs/05-api-integracoes/guia-configuracao.md`. Após editar a fonte, execute `pwsh -File docs/local/build-integrations.ps1` na raiz para atualizar a página HTML. Reinicie o servidor local após alterações na lista de páginas permitidas.

Esta pasta é versionada no Git e acompanha os clones do repositório. Não faz parte do aplicativo, Docker ou publicação. O acesso web continua somente local; não configure túneis ou hospedagem para ela. A visibilidade dos arquivos no Git acompanha a visibilidade do repositório.

Conteúdo elaborado em 25/09/2026. Preços possuem fontes e datas na página; valores pendentes estão explicitamente identificados. Nenhuma infraestrutura foi contratada ou alterada.


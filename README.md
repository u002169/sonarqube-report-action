# SonarQube Report

Gera report da análise do Sonar na log, summary e PR.

### Execução local para desenvolvimento

Execução via cmd. Não funciona via powershell ou bash.


```console
SET sonar-analysis-id=AZSCUMEmure-xcw1RbtP && SET sonar-project-key=performa-neon.api-demo && SET sonar-host-url=https://sonarqube.in.devneon.com.br && SET sonar-token=squ_a91a2ac9d5ba2164ba89058c5b12527205b2eb92 && node src/index.js
```

Zerando o analysis-id para uso da última análise a partir do projeto indicado
```console
SET sonar-analysis-id= && SET sonar-project-key=performa-neon.api-demo && SET sonar-host-url=https://sonarqube.in.devneon.com.br && SET sonar-token=squ_a91a2ac9d5ba2164ba89058c5b12527205b2eb92 && node src/index.js
```

Zerando o analysis-id
```console
echo %sonar-analysis-id%
set sonar-analysis-id=
```
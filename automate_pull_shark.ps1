# PowerShell Script to Automate GitHub Pull Shark Badge
# Runs completely via GitHub REST API (no local git clone needed)

$ErrorActionPreference = "Stop"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "    AUTOMATIZACION DE INSIGNIA PULL SHARK DE GITHUB     " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Solicitar credenciales
$username = Read-Host "Introduce tu usuario de GitHub"
if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Error "El usuario no puede estar vacio."
}

$token = Read-Host "Introduce tu GitHub Personal Access Token (PAT)"
if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Error "El token no puede estar vacio."
}

# Configurar headers para las peticiones API
$headers = @{
    "Authorization" = "token $token"
    "Accept"        = "application/vnd.github.v3+json"
}

# 2. Seleccionar el nivel/cantidad de PRs
Write-Host ""
Write-Host "Selecciona el nivel/cantidad de PRs que quieres realizar:" -ForegroundColor Yellow
Write-Host "1) Nivel 1 (2 PRs) - Desbloquea la insignia basica"
Write-Host "2) Nivel 2 (16 PRs) - Insignia de Bronce"
Write-Host "3) Nivel 3 (128 PRs) - Insignia de Plata"
Write-Host "4) Nivel 4 (1024 PRs) - Insignia de Oro (Atencion: puede tardar y llegar al limite de API!)"
Write-Host "5) Personalizado"
$option = Read-Host "Opcion (1-5)"

$targetPrs = 2
switch ($option) {
    "1" { $targetPrs = 2 }
    "2" { $targetPrs = 16 }
    "3" { $targetPrs = 128 }
    "4" { $targetPrs = 1024 }
    "5" { 
        $customVal = Read-Host "Introduce la cantidad de PRs personalizada"
        if ([int]::TryParse($customVal, [ref]$targetPrs)) {
            if ($targetPrs -lt 1) { $targetPrs = 1 }
        } else {
            Write-Host "Valor invalido, por defecto se haran 2 PRs." -ForegroundColor Yellow
            $targetPrs = 2
        }
    }
    Default {
        Write-Host "Opcion invalida, por defecto se haran 2 PRs." -ForegroundColor Yellow
        $targetPrs = 2
    }
}

$repoName = "temp-pull-shark-badge"

Write-Host ""
Write-Host "Iniciando proceso para realizar $targetPrs Pull Requests en el repositorio '$username/$repoName'..." -ForegroundColor Green

# 3. Crear el repositorio publico temporal
$createRepoUrl = "https://api.github.com/user/repos"
$repoBody = @{
    name      = $repoName
    private   = $false
    auto_init = $true
} | ConvertTo-Json

Write-Host "Creando repositorio publico temporal '$repoName'..." -ForegroundColor Cyan
try {
    $createResponse = Invoke-RestMethod -Uri $createRepoUrl -Method Post -Headers $headers -Body $repoBody -ContentType "application/json"
    Write-Host "Repositorio creado exitosamente!" -ForegroundColor Green
} catch {
    # Si ya existe, intentamos usarlo
    if ($_.Exception.Message -match "422") {
        Write-Host "El repositorio ya existe. Utilizando el existente." -ForegroundColor Yellow
    } else {
        Write-Error "Error al crear el repositorio: $_"
    }
}

# Pequena espera para que GitHub termine de inicializar el repositorio
Start-Sleep -Seconds 3

# 4. Obtener el SHA de la rama 'main'
$getMainRefUrl = "https://api.github.com/repos/$username/$repoName/git/ref/heads/main"
Write-Host "Obteniendo referencia de la rama principal (main)..." -ForegroundColor Cyan
try {
    $refResponse = Invoke-RestMethod -Uri $getMainRefUrl -Method Get -Headers $headers
    $mainSha = $refResponse.object.sha
} catch {
    Write-Error "No se pudo obtener la referencia de la rama main. Asegurate de que el token es correcto y que el repositorio se inicializo con un README. error: $_"
}

# 5. Ejecutar el bucle de creacion y merge de PRs
$successCount = 0
for ($i = 1; $i -le $targetPrs; $i++) {
    $branchName = "branch-pull-shark-$i"
    $fileName = "file-$i.txt"
    Write-Host "---------------------------------------------------" -ForegroundColor Gray
    Write-Host "[$i / $targetPrs] Procesando PR para rama '$branchName'..." -ForegroundColor Cyan

    try {
        # A. Crear la rama branch-i desde mainSha
        $createBranchUrl = "https://api.github.com/repos/$username/$repoName/git/refs"
        $branchBody = @{
            ref = "refs/heads/$branchName"
            sha = $mainSha
        } | ConvertTo-Json
        $null = Invoke-RestMethod -Uri $createBranchUrl -Method Post -Headers $headers -Body $branchBody -ContentType "application/json"

        # B. Crear/actualizar un archivo en la nueva rama (contenido base64 simple)
        $contentBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("pull shark auto-generate $i"))
        $createFileUrl = "https://api.github.com/repos/$username/$repoName/contents/$fileName"
        $fileBody = @{
            message = "Commit file $i"
            content = $contentBase64
            branch  = $branchName
        } | ConvertTo-Json
        $null = Invoke-RestMethod -Uri $createFileUrl -Method Put -Headers $headers -Body $fileBody -ContentType "application/json"

        # C. Crear la Pull Request
        $createPrUrl = "https://api.github.com/repos/$username/$repoName/pulls"
        $prBody = @{
            title = "Automated Pull Request #$i"
            head  = $branchName
            base  = "main"
        } | ConvertTo-Json
        $prResponse = Invoke-RestMethod -Uri $createPrUrl -Method Post -Headers $headers -Body $prBody -ContentType "application/json"
        $prNumber = $prResponse.number

        # D. Fusionar (Merge) la Pull Request
        $mergePrUrl = "https://api.github.com/repos/$username/$repoName/pulls/$prNumber/merge"
        $mergeBody = @{
            commit_title = "Merge Pull Request #$i"
            merge_method = "merge"
        } | ConvertTo-Json
        $null = Invoke-RestMethod -Uri $mergePrUrl -Method Put -Headers $headers -Body $mergeBody -ContentType "application/json"

        # E. Eliminar la rama remota
        $deleteBranchUrl = "https://api.github.com/repos/$username/$repoName/git/refs/heads/$branchName"
        $null = Invoke-RestMethod -Uri $deleteBranchUrl -Method Delete -Headers $headers

        $successCount++
        Write-Host "PR #$i creada y fusionada con exito!" -ForegroundColor Green

        # Delay para respetar rate limits y simular actividad espaciada
        if ($targetPrs -gt 50) {
            Start-Sleep -Milliseconds 150
        } else {
            Start-Sleep -Milliseconds 300
        }
    } catch {
        Write-Host "Error en la iteracion ${i}: $_" -ForegroundColor Red
        # Continuar con la siguiente para no detener todo el proceso si falla una
    }
}

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host " PROCESO TERMINADO. PRs fusionadas con exito: $successCount / $targetPrs" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Recomendacion:" -ForegroundColor Yellow
Write-Host "1. Podes ir a https://github.com/$username/$repoName para ver el historial de PRs."
Write-Host "2. GitHub suele tardar entre 24 y 48 horas en procesar las insignias de perfil."
Write-Host "3. Una vez que veas la insignia en tu perfil, podes eliminar el repositorio '$repoName' desde la configuracion del mismo."
Write-Host ""

Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# taskkill /PID <PRocess Id> /F
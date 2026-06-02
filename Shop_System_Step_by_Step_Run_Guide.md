# 🚀 Shop Management System: Step-by-Step Run Guide

This guide describes the exact steps required to initialize, boot, inspect, and troubleshoot the **Shop Management System**. 

---

## 📋 Prerequisites Checklist

Before executing any commands, verify that your environment contains the following tools:
- [ ] **Java Development Kit (JDK) 17 or higher**
- [ ] **Node.js (v18 or higher)** and **npm**
- [ ] **Internet Connection** (to resolve Maven and npm dependencies on first run)

---

## 🖥️ Command Execution Matrix

To run the complete system, you must launch **4 separate terminal windows** (or tabs) and execute commands in the respective folders:

| Order | Service Name | Directory | Port | Launch Command |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Eureka Server | `\eureka-server` | `8761` | `.\mvnw.cmd spring-boot:run` |
| **2** | User Service | `\user-service` | `8081` | `.\mvnw.cmd spring-boot:run` |
| **3** | Product Service | `\product-service`| `8082` | `.\mvnw.cmd spring-boot:run` |
| **4** | Frontend Client | `\shop-frontend` | `4200` | `npm run start` (or `ng serve`) |

---

## 👣 Step-by-Step Startup Sequence

### Step 1: Launch Eureka Discovery Server
Open Terminal 1, navigate to the `eureka-server` folder, and launch it:
```powershell
cd eureka-server
.\mvnw.cmd spring-boot:run
```
> [!IMPORTANT]
> Wait approximately 10-15 seconds for the server to bind to port `8761`. You can verify it is up by opening the Eureka Registry Console at http://localhost:8761 in your browser.

---

### Step 2: Launch User Microservice
Open Terminal 2, navigate to the `user-service` folder, and run:
```powershell
cd user-service
.\mvnw.cmd spring-boot:run
```
*This service handles logins, registrations, and database operations for admin accounts.*

---

### Step 3: Launch Product & Sales Microservice
Open Terminal 3, navigate to the `product-service` folder, and run:
```powershell
cd product-service
.\mvnw.cmd spring-boot:run
```
*This service hosts catalog assets, decrement logic, and logs purchase data.*

---

### Step 4: Launch Angular Frontend Client
Open Terminal 4, navigate to the `shop-frontend` folder, and launch the Webpack development server:
```powershell
cd shop-frontend
npm run start
```
*Wait for compile completion (usually displays `Application bundle generation complete` in under 5 seconds).*

---

## 🔗 Key Control & Access URLs

Once all services are running, bookmark these URLs to manage and monitor your shop portal:

* **💻 Portal Frontend Client:** http://localhost:4200/
* **📡 Eureka Services Registry Dashboard:** http://localhost:8761/
* **🗄️ User Service H2 Database Console:** http://localhost:8081/h2-console
  * *JDBC URL:* `jdbc:h2:mem:userdb`
  * *Username:* `sa`
  * *Password:* (leave empty)
* **🗄️ Product Service H2 Database Console:** http://localhost:8082/h2-console
  * *JDBC URL:* `jdbc:h2:mem:productdb`
  * *Username:* `sa`
  * *Password:* (leave empty)

---

## 🛠️ Troubleshooting Playbook

> [!WARNING]
> If a service fails to start or displays a `BindException` (Address already in use), it means another process is blocking the port. Follow these commands in Windows PowerShell to terminate it.

### Finding & Terminating Blocked Ports

1. **Find the Process ID (PID) blocking the port:**
   For example, if port `8082` (Product Service) is occupied:
   ```powershell
   netstat -ano | findstr :8082
   ```
   *Look at the rightmost column to get the PID (e.g., `21540`).*

2. **Terminate the process directly:**
   Use the PID identified in the step above:
   ```powershell
   taskkill /F /PID 21540
   ```
   *Replace `21540` with the actual PID returned on your system.*

3. **Re-run the command:**
   Run `.\mvnw.cmd spring-boot:run` again inside the service folder.

---

### Database Console Connection Errors
If you connect to the H2 database and do not see the tables (`users`, `products`, `sales_records`), verify your **JDBC URL** matches:
* User DB Console: `jdbc:h2:mem:userdb`
* Product DB Console: `jdbc:h2:mem:productdb`
*(Default configuration creates the schemas automatically in memory upon boot).*

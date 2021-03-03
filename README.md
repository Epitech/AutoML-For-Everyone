# DOCAPOSTE AI Project

# Requirements

## Windows

Install Docker on windows :
* [Docker Desktop](https://docs.docker.com/docker-for-windows/install/)

If you encounter a problem similar to the screenshot below, check that virtualization is enabled in the bios.

![alt text](./assets_docs/problem.png)

Follow these instructions : 

1. In the case the problem persists, start a powershell as administrator.
2. Run bcdedit /set hypervisorlaunchtype auto
3. Restart your computer

If you encounter a problem with WSL2, follow the step 4 of this [link](https://docs.microsoft.com/fr-fr/windows/wsl/install-win10#step-4---download-the-linux-kernel-update-package)

## Linux

Install Docker on Linux :
* [CentOS](https://docs.docker.com/engine/install/centos/)
* [Debian](https://docs.docker.com/engine/install/debian/)
* [Fedora](https://docs.docker.com/engine/install/fedora/)
* [Ubuntu](https://docs.docker.com/engine/install/ubuntu/)

# Installation

## Windows

1. Open Docker Desktop and check that the strip in the bottom left corner is green
2. Clone our repository
3. Enter the root directory of the projet
4. Execute the following command with powershell 
```
docker-compose up --build
```
5. In the Containers / Apps tab you should have a banner named docaposte
6. You can now access the platform with this [link](localhost:4200)

## Linux

1. Clone our repository
2. Enter the root directory of the projet
3. Execute the following command 
```
docker-compose up --build
```
4. You can now access the platform with this [link](localhost:4200)

# How to use the platform ?

To know how to use this web platform you will find user documentation via this [link](./HOW_TO_USE.md)

# Credits

Made with :heart: by [PoC](https://poc-innovation.fr)

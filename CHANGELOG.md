v 1.14.2

- fix bug where the /employees/{employeeId} (GET) was returning unwanted field

v 1.14.1

- debug info for create timesheet record
- refactor the build image script 

v 1.14.0

- improve update employee to also allow for project updates

v 1.13.0

- add update employee functionality with endpoints:
  /employees/{employeeId} (PATCH)

v 1.12.4

- hotfix for get employee by id, endpoint:
  /employees/{employeeId} (GET)

v 1.12.3

- audit fix for @babel/traverse

v 1.12.2

- repository design pattern refactorization
- small fixes for responses and error handling

v 1.12.1

- hotfix for deployment script: change the way the script gets the branch name

v 1.12.0

- add delete position functionality with the following endpoint:
  /positions/{positionId} (DELETE)

v 1.11.0

- add script for easier deployment
- deploy the api-service

v 1.10.0

- add edit position functionality with the following endpoint:
  /positions/{positionId} (PUT)

v 1.9.0

- add user request filter for the endpoint:
  /employees/:employeeId/timesheets (GET)
  this filter will only display data based on your user role

v 1.8.0

- add get records for standard users with the following endpoint:
  /employees/:employeeId/timesheets (GET)

v 1.7.1

- refactor roles and permissions functionality

v 1.7.0

- add register time for employees functionality with the following endpoint:
  /employees/records (POST)

v 1.6.0

- add get employees functionality with the following endpoints:
  /employees (GET)
  /employees/{employeeId} (GET)

v 1.5.0

- add create job position functionality with the following endpoint:
  /positions (POST)

v 1.4.0

- add create employee functionality with the following endpoint:
  /employees (POST)
- resolve wrong response for get department by ID
- refactor send email functionality to be more generic

v 1.3.0

- change the login response, add two new fields, refreshToken and expiresIn

v 1.2.0

- add create projects functionality

v 1.1.0

- add view projects functionality with the following endpoints:
  view all projects, view project by ID and view project from a department

v 1.0.1

- project structure refactorization

v 1.0.0

- refactor API's responses to be compliant with json:api standard

v 0.13.0

- add edit department functionality

v 0.12.0

- add view positions functionality

v 0.11.0

- add view departments functionality

v 0.10.0

- add delete department functionality

v 0.9.0

- add create department functionality

v 0.8.0

- add guard to protect routes

v 0.7.0

- add user login
- add reset password functionality

v 0.6.0

- add user register

v 0.5.0

- add db connection

v 0.4.0

- dependency update

v 0.3.0

- swagger implementation

v 0.2.0

- add logging

v 0.1.0

- project base setup

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 0.7.2 - 2022-02-15

- Fixed regression in `validateAuthentication`.

## 0.7.1 - 2022-02-10

### Fixed

- Fixed unhandled `404 Not Found` response error that terminated the employee
  files step.

## 0.7.0 - 2022-02-07

### Changed

- Moved questions file into graph project

### Fixed

- Fixed NPM package build

## 0.6.0 - 2022-02-07

### Added

- New properties added to resources:

  | Entity              | Properties                                                   |
  | ------------------- | ------------------------------------------------------------ |
  | `bamboohr_employee` | `active: boolean`                                            |
  | `bamboohr_employee` | `status: "Active", "Inactive"`                               |
  | `bamboohr_employee` | `employmentHistoryStatus: "Contractor", "Full-Time", string` |
  | `bamboohr_employee` | `employeeNumber: string`                                     |

### Changed

- Updated to latest `@jupiterone/sdk` package versions
- Moved from `/directory` to `/reports/custom` API for employee data to include
  all active and inactive employees and avoid N+1 API calls for employee
  details. This is the recommended API in the BambooHR documentation.
- Removed an additional call to the `/directory` API when fetching users. This
  was used to get details about users from employee records which is no longer
  necessary thanks to using the custom report output.

## 0.5.0 - 2021-10-14

### Added

- New properties added to resources:

  | Entity              | Properties        |
  | ------------------- | ----------------- |
  | `bamboohr_employee` | `hireDate`        |
  | `bamboohr_employee` | `terminationDate` |

## 0.4.0 - 2021-08-13

### Added

- Added spec declaration
- Added support for ingesting the following **new** entities:

  | Resources | Entity `_type`      | Entity `_class` |
  | --------- | ------------------- | --------------- |
  | Employee  | `bamboohr_employee` | `Record`        |

- Added support for ingesting the following **new** relationships:

  | Source             | \_class | Target              |
  | ------------------ | ------- | ------------------- |
  | `bamboohr_account` | **HAS** | `bamboohr_employee` |
  | `bamboohr_user`    | **IS**  | `bamboohr_employee` |

### Updated

- Update integration documentation

## 0.3.4 - 2021-02-03

### Added

- Added some grace to namespace configuration to allow for
  `jupiterone.bamboohr.com` and `https://jupiterone.bamboohr.com` as well as
  `jupiterone`
- Fix authentication validation check that failed when there is no employee `0`

## 0.3.3 - 2020-11-30

### Added

- Add the `supervisor` property to employee entities

## 0.3.2 - 2020-11-20

### Changed

- Use `id` property for `bamboohr_user._key` instead of `email`, which can be
  null.

## 0.3.1 - 2020-11-19

### Changed

- Do not use `Promise.all` to resolve multiple promises. `Promise.all` fails
  fast, rejecting instantly once any of the promises rejects. This causes
  unhandled promise rejections when more than one promise fails in array.

## 0.3.0 - 2020-10-29

- Upgrade SDK v4

## v0.2.0 - 2020-10-02

### Added

- Added `location`, `jobTitle`, `workEmail`, `department`, `division`,
  `mobilePhone`, and `workPhone` properties to `bamboohr_user` entity.
- Set `User.active === true` when `User.status === 'enabled'`

## v0.1.0 - 2020-09-28

### Added

- Initial commit of `bamboohr_account`, `bamboohr_user`, and `bamboohr_file`
  entities.

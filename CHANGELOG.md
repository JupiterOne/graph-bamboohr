# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

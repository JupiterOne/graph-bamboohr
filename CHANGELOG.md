# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## v0.2.0 - 2020-10-02

### Added

- Added `location`, `jobTitle`, `workEmail`, `department`, `division`,
  `mobilePhone`, and `workPhone` properties to `bamboohr_user` entity.
- Set `User.active === true` when `User.status === 'enabled'`

## v0.1.0 - 2020-09-28

### Added

- Initial commit of `bamboohr_account`, `bamboohr_user`, and `bamboohr_file`
  entities.

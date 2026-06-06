# Changelog

All notable changes to the `@freezeehost/baileys` project will be documented in this file.

## [2.1.7] - 2026-06-04
### Added
- GitHub Actions CI for automated testing.
- Official Security Policy (`SECURITY.md`).
- This `CHANGELOG.md` for better project tracking.

## [2.1.6] - 2026-06-04
### Changed
- **Scoped Package Name**: Renamed to `@freezeehost/baileys`.
- **Lower Node Requirement**: Lowered to `>=20.0.0` for better compatibility.
- **LICENSE**: Updated to reflect FreeZeeHost Team maintenance.

## [2.1.5] - 2026-06-04
### Added
- **Meta AI Full Suite**: Support for Tables, Reels, Code Blocks, Grid Images, and more.
- **Advanced AI Behaviors**: Thinking indicators, User feedback, and Model branding.
- **Native WhatsApp Features**: Group Events, Status Q&A, In-Thread Surveys, Native Invoices/Orders.
- **Performance Engine**: Auto-Medic (Socket watchdog), Smart Media Proxy (Deduplication), and Stealth Mode.
- **Hybrid Pairing**: Intelligent auto-detection of QR vs Pairing Code.
- **TypeScript Types**: Full `.d.ts` definitions for all new features.

### Fixed
- Fixed critical "this.ctor" bug in Protobuf generation causing connection drops.
- Fixed "Invalid Media Type" error for rich messages.
- Fixed silent message drops by implementing the mandatory `botForwardedMessage` wrapper.

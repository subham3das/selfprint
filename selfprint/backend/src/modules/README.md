# Modules Directory (Feature-First Architecture)

Every future feature module in Self Print must be encapsulated in its own folder following this exact structure:

```
modules/<feature_name>/
├── <feature>.controller.ts    # HTTP request handling (No business logic)
├── <feature>.service.ts       # Core business logic & rule enforcement
├── <feature>.repository.ts    # MongoDB queries extending BaseRepository
├── <feature>.routes.ts        # Endpoint mappings & middleware attachments
├── <feature>.validation.ts    # Zod input validation schemas
├── <feature>.types.ts         # TypeScript entity and DTO types
├── <feature>.constants.ts     # Feature-specific constants
└── index.ts                   # Clean public module exports
```

### Key Architecture Rules:
1. **Controllers** only handle input parsing and standard response formatting.
2. **Services** execute all business rules, orchestration, and validations.
3. **Repositories** only interact with MongoDB.
4. **No Code Duplication**: Always leverage shared utilities in `common/`, `utils/`, `middlewares/`, `responses/`, and `cloudinary/`.

# Models Directory

> ⚠️ **CRITICAL RULE**: DO NOT CREATE MongoDB MODELS OR COLLECTIONS HERE PREMATURELY.
>
> All database schemas and collections must be introduced **feature-by-feature** in accordance with `DATABASE.md`.
>
> When a new model is introduced:
> 1. Document the collection, indexes, fields, and relations in `DATABASE.md`.
> 2. Create the Mongoose Schema & Model file inside this directory (or within its feature module).
> 3. Create the corresponding Repository and Service layers.

Database Schema :-

The database schema is designed to efficiently manage and track data related to boxes, packed items, and fresh produce using SQLAlchemy. It consists of three main tables: Box, PackedItem, and FreshProduce. The Box table represents containers with unique box_code identifiers and relationships to the items they contain. The PackedItem table stores details such as manufacturing and expiry dates, brand, item count, and expected life span, facilitating traceability and quality checks. Similarly, the FreshProduce table manages details like produce type, freshness index, and shelf life, enabling the monitoring of perishable items. The schema leverages relational mapping with foreign keys to associate items with their respective boxes and enforces constraints like uniqueness and non-nullable fields to ensure data integrity. It also uses DateTime fields with default timestamps to capture record creation times, supporting accurate historical tracking and analysis.

 <img width="1233" alt="image" src="https://github.com/user-attachments/assets/bb8eb77c-2ddf-44cb-b34b-e98f4c270bad" />


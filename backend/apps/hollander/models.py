"""
Hollander Database Models
==========================
Complete database schema for Hollander interchange system including:
- Reference data (Makes, Models, Part Types)
- Interchange data (18M+ records)
- Pricing data (577K+ records with options)
"""

from django.db import models


class Make(models.Model):
    """Vehicle Make reference table"""
    make_id = models.IntegerField(unique=True)
    make_name = models.CharField(max_length=100, db_index=True)
    
    class Meta:
        db_table = 'hollander_make'
        ordering = ['make_name']
    
    def __str__(self):
        return self.make_name


class Model(models.Model):
    """Vehicle Model reference table"""
    model_id = models.IntegerField(unique=True)
    make = models.ForeignKey(Make, on_delete=models.CASCADE, related_name='models', to_field='make_id')
    model_name = models.CharField(max_length=100, db_index=True)
    
    class Meta:
        db_table = 'hollander_model'
        ordering = ['model_name']
        indexes = [
            models.Index(fields=['make', 'model_name']),
        ]
    
    def __str__(self):
        return f"{self.make.make_name} {self.model_name}"


class PartType(models.Model):
    """Part Type reference table"""
    part_id = models.IntegerField(unique=True)
    part_name = models.CharField(max_length=200, db_index=True)
    
    class Meta:
        db_table = 'hollander_part_type'
        ordering = ['part_name']
    
    def __str__(self):
        return self.part_name


class YearRange(models.Model):
    """Year ranges for Make/Model combinations"""
    make = models.ForeignKey(Make, on_delete=models.CASCADE, related_name='year_ranges')
    model = models.ForeignKey(Model, on_delete=models.CASCADE, related_name='year_ranges')
    year_start = models.IntegerField()
    year_end = models.IntegerField()
    
    class Meta:
        db_table = 'hollander_year_range'
        unique_together = ['make', 'model']
        indexes = [
            models.Index(fields=['make', 'model']),
        ]
    
    def __str__(self):
        return f"{self.make.make_name} {self.model.model_name} ({self.year_start}-{self.year_end})"


class HollanderInterchange(models.Model):
    """
    Main Hollander Interchange Table
    Contains 18M+ records of part compatibility data
    """
    hollander_number = models.CharField(max_length=50, db_index=True)
    year_start = models.IntegerField(default=0)
    year_end = models.IntegerField(default=0)
    make = models.CharField(max_length=100, db_index=True, blank=True, default='')
    model = models.CharField(max_length=100, db_index=True, blank=True, default='')
    part_type = models.CharField(max_length=100, db_index=True, blank=True, default='')
    part_name = models.CharField(max_length=200, blank=True, default='')
    options = models.TextField(blank=True, default='')  # Can be long with multiple options
    notes = models.TextField(blank=True, default='')
    
    # Raw data fields from JSON
    mfr_code = models.CharField(max_length=10, blank=True, default='')
    part_type_number = models.CharField(max_length=10, blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hollander_interchange'
        ordering = ['hollander_number']
        indexes = [
            models.Index(fields=['year_start', 'year_end', 'make', 'model', 'part_type']),
            models.Index(fields=['hollander_number', 'part_type']),
            models.Index(fields=['make', 'model']),
        ]

    def __str__(self):
        return f"{self.hollander_number} - {self.year_start}-{self.year_end} {self.make} {self.model} {self.part_type}"


class Vendor(models.Model):
    """Vendor/Yard Information Table"""
    yard_id = models.IntegerField(unique=True, help_text="Legacy ID from _yard.json")
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=10, blank=True, default='')
    zip_code = models.CharField(max_length=20, blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    website = models.URLField(blank=True, default='')
    
    # UI/Frontend Fields
    description = models.TextField(blank=True, default='')
    review_snippet = models.TextField(blank=True, default='')
    profile_url = models.CharField(max_length=255, blank=True, default='')
    logo = models.ImageField(upload_to='vendor_logos/', blank=True, null=True, default='')
    
    rating = models.CharField(max_length=20, default="100%")
    rating_stars = models.IntegerField(default=5)
    rating_percentage = models.IntegerField(default=100)
    
    is_top_rated = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_trusted = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    inventory_preferences = models.JSONField(blank=True, default=dict, help_text='Inventory management settings')
    
    class Meta:
        db_table = 'hollander_vendor'
        ordering = ['name']

    def __str__(self):
        return self.name


class YardMake(models.Model):
    """
    Tracks which vehicle makes each yard specializes in
    From _yardmake.json
    """
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='yard_makes', to_field='yard_id')
    make = models.ForeignKey(Make, on_delete=models.CASCADE, related_name='yards', to_field='make_id')
    
    class Meta:
        db_table = 'hollander_yard_make'
        unique_together = ['vendor', 'make']
        indexes = [
            models.Index(fields=['vendor', 'make']),
        ]
    
    def __str__(self):
        return f"{self.vendor.name} - {self.make.make_name}"


class YardPart(models.Model):
    """
    Tracks which part types each yard specializes in
    From _yardparts.json
    """
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='yard_parts', to_field='yard_id')
    part_type = models.ForeignKey(PartType, on_delete=models.CASCADE, related_name='yards', to_field='part_id')
    
    class Meta:
        db_table = 'hollander_yard_part'
        unique_together = ['vendor', 'part_type']
        indexes = [
            models.Index(fields=['vendor', 'part_type']),
        ]
    
    def __str__(self):
        return f"{self.vendor.name} - {self.part_type.part_name}"


class PartPricing(models.Model):
    """
    Part Pricing Table
    Contains 577K+ pricing records with detailed options
    """
    hollander_number = models.CharField(max_length=50, db_index=True)
    make = models.CharField(max_length=100, blank=True, default='')
    model = models.CharField(max_length=100, blank=True, default='')
    part_name = models.CharField(max_length=200, blank=True, default='')
    year_start = models.IntegerField(default=0)
    year_end = models.IntegerField(default=0)
    
    # Normalized References (Nullable for safe migration)
    # Using existing Make/Model/PartType classes defined at top of file
    make_ref = models.ForeignKey('Make', on_delete=models.SET_NULL, null=True, blank=True, related_name='pricing')
    model_ref = models.ForeignKey('Model', on_delete=models.SET_NULL, null=True, blank=True, related_name='pricing')
    part_type_ref = models.ForeignKey('PartType', on_delete=models.SET_NULL, null=True, blank=True, related_name='pricing')
    vendor = models.ForeignKey('Vendor', on_delete=models.SET_NULL, null=True, blank=True, related_name='pricing')

    
    # Price fields
    new_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    wow_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cts_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Options fields (NewOption1 through NewOption11)
    option1 = models.CharField(max_length=200, blank=True, default='')
    option2 = models.CharField(max_length=200, blank=True, default='')
    option3 = models.CharField(max_length=200, blank=True, default='')
    option4 = models.CharField(max_length=200, blank=True, default='')
    option5 = models.CharField(max_length=200, blank=True, default='')
    option6 = models.CharField(max_length=200, blank=True, default='')
    option7 = models.CharField(max_length=200, blank=True, default='')
    option8 = models.CharField(max_length=200, blank=True, default='')
    option9 = models.CharField(max_length=200, blank=True, default='')
    option10 = models.CharField(max_length=200, blank=True, default='')
    option11 = models.CharField(max_length=200, blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hollander_part_pricing'
        ordering = ['hollander_number']
        indexes = [
            models.Index(fields=['hollander_number']),
            models.Index(fields=['make', 'model', 'part_name']),
        ]

    def __str__(self):
        return f"{self.hollander_number} - {self.make} {self.model} {self.part_name}"
    
    def get_all_options(self):
        """Return all non-empty options as a comma-separated string"""
        options = []
        for i in range(1, 12):
            opt = getattr(self, f'option{i}', '')
            if opt and opt.strip():
                options.append(opt.strip())
        return ", ".join(options)


class PartSpecification(models.Model):
    """
    Detailed part specifications and options
    Links to pricing data
    """
    pricing = models.ForeignKey(PartPricing, on_delete=models.CASCADE, related_name='specifications')
    specification_name = models.CharField(max_length=200)
    specification_value = models.CharField(max_length=500)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hollander_part_specification'
        ordering = ['specification_name']

    def __str__(self):
        return f"{self.specification_name}: {self.specification_value}"


# Phase 3: Extended Data Models (Hollander Interchange & Media)

class HollanderMakeModelRef(models.Model):
    """
    Mapping from O_xTabMakeModelRef.json
    Links Hollander specific Make/Model codes to Names
    """
    ref_id = models.IntegerField(unique=True)
    h_make_code = models.CharField(max_length=50) # "VA"
    h_make = models.CharField(max_length=100) # "Acura"
    h_model = models.CharField(max_length=100) # "CL"
    aph_make = models.CharField(max_length=100, blank=True)
    aph_model = models.CharField(max_length=100, blank=True)
    a_url = models.CharField(max_length=200, blank=True)
    active_flag = models.BooleanField(default=True)

    class Meta:
        db_table = 'hollander_make_model_ref'

    def __str__(self):
        return f"{self.h_make} {self.h_model} ({self.h_make_code})"


class HollanderPartRef(models.Model):
    """
    Mapping from O_xTabPartRef.json
    """
    vpid = models.IntegerField(unique=True)
    part_code = models.CharField(max_length=50) # "319"
    part_name = models.CharField(max_length=200) # "Air Cleaner Box"
    part_url = models.CharField(max_length=200, blank=True)
    part_kw = models.CharField(max_length=200, blank=True)
    active_flag = models.BooleanField(default=True)

    class Meta:
        db_table = 'hollander_part_ref'

    def __str__(self):
        return self.part_name


class HollanderIndex(models.Model):
    """
    Mapping from O_IndexList.json
    The core Interchange Index linking Models + Parts -> IDXID
    """
    # NO unique PK from JSON mostly, use auto ID or IDXID if unique? 
    # IDXID seems to be the interchange grouping ID.
    idx_id = models.CharField(max_length=50, db_index=True) # "130163"
    model_nm = models.CharField(max_length=50, db_index=True) # "1000" (Model ID from Ref?)
    part_type_nbr = models.CharField(max_length=50, db_index=True) # "100"
    mfr_cd = models.CharField(max_length=50, blank=True) # "GM"
    begin_year = models.IntegerField(default=0)
    end_year = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'hollander_index'
        indexes = [
            models.Index(fields=['idx_id']),
            models.Index(fields=['model_nm', 'part_type_nbr']),
        ]

    def __str__(self):
        return f"IDX:{self.idx_id} Code:{self.part_type_nbr} Model:{self.model_nm}"


class VehicleImage(models.Model):
    """
    Mapping from Images.json
    """
    image_id = models.IntegerField(unique=True)
    image_target_id = models.IntegerField(db_index=True) # Links to... Vehicle or Part?
    image_category_id = models.IntegerField()
    image_file_name = models.CharField(max_length=255)
    image_title = models.CharField(max_length=255, blank=True)
    image_created_on = models.DateTimeField(null=True, blank=True)
    image_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = 'hollander_vehicle_image'

    # Phase 4: Supporting Data Models (Locations & Vendor Extensions)

class State(models.Model):
    """
    Mapping from _state.json
    """
    state_code = models.CharField(max_length=5, unique=True) # "AL"
    name = models.CharField(max_length=100) # "Alabama"
    country_id = models.IntegerField(default=1)

    class Meta:
        db_table = 'hollander_state'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.state_code})"


class Zipcode(models.Model):
    """
    Mapping from Zipcodes.json
    """
    zipcode_id = models.IntegerField(unique=True)
    postal_code = models.CharField(max_length=20, db_index=True)
    city_name = models.CharField(max_length=100)
    state_abbr = models.CharField(max_length=5, db_index=True) # Link to State.state_code usually
    county_name = models.CharField(max_length=100, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Store other fields as needed or keep simple
    
    class Meta:
        db_table = 'hollander_zipcode'
        indexes = [
            models.Index(fields=['postal_code']),
            models.Index(fields=['city_name']),
        ]

    def __str__(self):
        return f"{self.postal_code} - {self.city_name}, {self.state_abbr}"


class VendorRating(models.Model):
    """
    Mapping from _rate.json
    """
    rate_id = models.IntegerField(unique=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, to_field='yard_id', related_name='ratings')
    service_score = models.IntegerField(default=0) # Service
    quality_score = models.IntegerField(default=0) # Quality
    price_score = models.IntegerField(default=0) # Price
    comment = models.TextField(blank=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    date_posted = models.CharField(max_length=50, blank=True) # Keep orig format or helper convert

    class Meta:
        db_table = 'hollander_vendor_rating'

    def __str__(self):
        return f"Rating {self.rate_id} for Yard {self.vendor_id}"


class VendorDetail(models.Model):
    """
    Mapping from _yarddetails.json
    """
    vendor = models.OneToOneField(Vendor, on_delete=models.CASCADE, to_field='yard_id', related_name='details')
    payment_visa = models.BooleanField(default=False)
    payment_mastercard = models.BooleanField(default=False)
    payment_amex = models.BooleanField(default=False)
    payment_discover = models.BooleanField(default=False)
    payment_check = models.BooleanField(default=False)
    in_business_since = models.IntegerField(default=0)
    warranty_num = models.IntegerField(default=0)
    warranty_type = models.IntegerField(default=0)

    class Meta:
        db_table = 'hollander_vendor_detail'


class VendorHours(models.Model):
    """
    Mapping from _openclosetime.json
    """
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, to_field='yard_id', related_name='hours')
    weekday_id = models.IntegerField() # 1-7 likely
    open_time = models.CharField(max_length=50, blank=True) # Stored as string datetime in JSON
    close_time = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'hollander_vendor_hours'


    # Phase 5: Legacy Accounts & Users

class Association(models.Model):
    """
    Mapping from Associations.json
    Professional organizations / Trade groups.
    """
    association_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=255) # associationName
    url = models.CharField(max_length=255, blank=True) # associationUrl
    state_code = models.CharField(max_length=10, blank=True) # associationState
    country_code = models.CharField(max_length=10, blank=True) # associationCountry
    is_deleted = models.BooleanField(default=False) # associationDeleted

    class Meta:
        db_table = 'hollander_association'

    def __str__(self):
        return self.name


class LegacyAccount(models.Model):
    """
    Mapping from Accounts.json
    Represents a legacy business entity or yard account.
    """
    account_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=255, blank=True) # accountName
    profile_title = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True, null=True) # accountOwnerEmail
    contact_phone = models.CharField(max_length=50, blank=True)
    
    # Address
    address_street1 = models.CharField(max_length=255, blank=True)
    address_city = models.CharField(max_length=100, blank=True)
    address_state = models.CharField(max_length=50, blank=True)
    address_zip = models.CharField(max_length=20, blank=True)
    address_country = models.CharField(max_length=50, blank=True)
    
    # Metadata
    created_at = models.CharField(max_length=50, blank=True) # Keep orig string format for safety
    is_active = models.BooleanField(default=True) # accountActive
    
    # Coordinates (if available here)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'hollander_legacy_account'

    def __str__(self):
        return self.name or f"Account {self.account_id}"


class LegacyUser(models.Model):
    """
    Mapping from Users.json
    Represents legacy login credentials and user profiles.
    """
    user_id = models.IntegerField(unique=True)
    email = models.EmailField(db_index=True) # userEmail
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    
    # Auth
    password_hash = models.CharField(max_length=255) # userPassword
    password_salt = models.CharField(max_length=255, blank=True) # userPasswordSalt
    legacy_password_plain = models.CharField(max_length=255, blank=True) # userPasswordOld (sometimes plain?)
    
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'hollander_legacy_user'

    def __str__(self):
        return self.email


    # Phase 6: Configuration & Presets

class Country(models.Model):
    """
    Mapping from _country.json
    """
    country_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'hollander_country'
        verbose_name_plural = 'Countries'

    def __str__(self):
        return self.name

# -- Preset Categories --

class PresetMake(models.Model):
    """ _presetmake.json """
    preset_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'hollander_preset_make_group'

class PresetMakeItem(models.Model):
    """ _presetmakemakes.json """
    preset = models.ForeignKey(PresetMake, on_delete=models.CASCADE, related_name='items')
    make_id = models.IntegerField() # Link to Make.make_id (loose coupling import)

    class Meta:
        db_table = 'hollander_preset_make_item'

class PresetModel(models.Model):
    """ _presetmodel.json (assumed) """
    preset_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'hollander_preset_model_group'

class PresetModelItem(models.Model):
    """ _presetmodelmodels.json (assumed) """
    preset = models.ForeignKey(PresetModel, on_delete=models.CASCADE, related_name='items')
    model_id = models.IntegerField() 

    class Meta:
        db_table = 'hollander_preset_model_item'

class PresetPart(models.Model):
    """ _presetpart.json """
    preset_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'hollander_preset_part_group'

class PresetPartItem(models.Model):
    """ _presetpartparts.json """
    preset = models.ForeignKey(PresetPart, on_delete=models.CASCADE, related_name='items')
    part_id = models.IntegerField()

    class Meta:
        db_table = 'hollander_preset_part_item'

class PresetLocation(models.Model):
    """ _presetlocation.json """
    preset_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'hollander_preset_location_group'

class PresetLocationItem(models.Model):
    """ _presetlocationlocations.json """
    preset = models.ForeignKey(PresetLocation, on_delete=models.CASCADE, related_name='items')
    location_id = models.IntegerField() # references Zipcodes or similar?

    class Meta:
        db_table = 'hollander_preset_location_item'

class PresetVehicle(models.Model):
    """ _presetvehicle.json """
    preset_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'hollander_preset_vehicle_group'

class PresetVehicleItem(models.Model):
    """ _presetvehiclevehicles.json """
    preset = models.ForeignKey(PresetVehicle, on_delete=models.CASCADE, related_name='items')
    vehicle_id = models.IntegerField()

    class Meta:
        db_table = 'hollander_preset_vehicle_item'

    # Phase 7: Activity Logs

class ProfileVisit(models.Model):
    """
    Mapping from ProfileVisits.json
    Large dataset of tracking logs.
    """
    tracking_id = models.BigIntegerField(unique=True) # Likely big int
    account_id = models.IntegerField(db_index=True) # Links to LegacyAccount
    created_on = models.DateTimeField(null=True, blank=True) # trackingCreatedOn

    class Meta:
        db_table = 'hollander_profile_visit'
        ordering = ['-created_on']

    def __str__(self):
        return f"Log {self.tracking_id} - Account {self.account_id}"





# -- IMPORT TRACKING (Moved from import_models.py) --
import uuid
from django.conf import settings

class VendorImportBatch(models.Model):
    """
    Tracks each bulk import operation
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('rolled_back', 'Rolled Back'),
    ]
    
    batch_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='vendor_imports'
    )
    filename = models.CharField(max_length=255)
    total_rows = models.IntegerField(default=0)
    valid_rows = models.IntegerField(default=0)
    invalid_rows = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'vendor_import_batch'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Import Batch {self.batch_id} - {self.filename} ({self.status})"


class VendorImportRecord(models.Model):
    """
    Tracks individual vendor imports within a batch
    Stores previous state for rollback capability
    """
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('skipped', 'Skipped'),
        ('failed', 'Failed'),
    ]
    
    batch = models.ForeignKey(
        VendorImportBatch,
        on_delete=models.CASCADE,
        related_name='records'
    )
    vendor = models.ForeignKey(
        'Vendor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='import_records'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    row_number = models.IntegerField()
    previous_state = models.JSONField(
        null=True,
        blank=True,
        help_text='Vendor data before update (for rollback)'
    )
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vendor_import_record'
        ordering = ['batch', 'row_number']
        indexes = [
            models.Index(fields=['batch', 'action']),
        ]
        
    def __str__(self):
        vendor_name = self.vendor.name if self.vendor else "Unknown"
        return f"Row {self.row_number}: {self.action} - {vendor_name}"

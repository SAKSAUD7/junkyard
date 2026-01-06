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

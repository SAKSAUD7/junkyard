from django.db import models


class Make(models.Model):
    """Vehicle make model"""
    make_id = models.IntegerField(unique=True)
    make_name = models.CharField(max_length=100)

    class Meta:
        ordering = ['make_name']

    def __str__(self):
        return self.make_name


class Model(models.Model):
    """Vehicle model"""
    model_id = models.IntegerField(unique=True)
    model_name = models.CharField(max_length=100)
    make = models.ForeignKey(Make, on_delete=models.CASCADE, related_name='models', to_field='make_id')

    class Meta:
        ordering = ['model_name']

    def __str__(self):
        return f"{self.make.make_name} {self.model_name}"


class Part(models.Model):
    """Auto part model"""
    part_id = models.IntegerField(unique=True)
    part_name = models.CharField(max_length=100)

    class Meta:
        ordering = ['part_name']

    def __str__(self):
        return self.part_name


class State(models.Model):
    """US State model"""
    state_id = models.IntegerField(unique=True)
    state_name = models.CharField(max_length=100)
    state_code = models.CharField(max_length=10)

    class Meta:
        ordering = ['state_name']

    def __str__(self):
        return f"{self.state_name} ({self.state_code})"


class City(models.Model):
    """City model"""
    city_id = models.IntegerField(unique=True)
    city_name = models.CharField(max_length=100)
    state = models.CharField(max_length=50)

    class Meta:
        ordering = ['city_name']
        verbose_name_plural = "Cities"

    def __str__(self):
        return f"{self.city_name}, {self.state}"

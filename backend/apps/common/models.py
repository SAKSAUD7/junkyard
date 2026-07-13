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


class ContactMessage(models.Model):
    """Stores contact form submissions"""
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} - {self.email}"


class Feedback(models.Model):
    """Global user feedback submissions"""
    TOPIC_CHOICES = (
        ('find_business', 'Can\'t find a business'),
        ('bug', 'Report a bug or issue'),
        ('suggestion', 'Feature suggestion'),
        ('general', 'General feedback'),
    )
    STATUS_CHOICES = (
        ('unread', 'Unread'),
        ('read', 'Read'),
        ('resolved', 'Resolved'),
    )
    
    topic = models.CharField(max_length=50, choices=TOPIC_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unread', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Feedback'
        verbose_name_plural = 'Feedback Submissions'
        
    def __str__(self):
        return f"Feedback #{self.id} - {self.get_topic_display()}"


class CustomRedirect(models.Model):
    """Stores 301 and 302 redirects for SEO preservation"""
    old_path = models.CharField(max_length=500, db_index=True, unique=True, help_text="This should be an absolute path, excluding the domain name. Example: '/events/search/'.")
    new_path = models.CharField(max_length=500, blank=True, help_text="This can be either an absolute path (as above) or a full URL starting with 'http://'.")
    status_code = models.SmallIntegerField(default=301, choices=[(301, '301 - Permanent'), (302, '302 - Temporary')])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['old_path']
        verbose_name = 'Redirect'
        verbose_name_plural = 'Redirects'

    def __str__(self):
        return f"{self.old_path} ---> {self.new_path} ({self.status_code})"
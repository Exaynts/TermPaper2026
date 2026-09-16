import django_filters
from django.db.models import F, ExpressionWrapper, DecimalField
from .models import Course


class CourseFilter(django_filters.FilterSet):
    # Категории – без изменений
    categories = django_filters.BaseInFilter(field_name='category__category_id', lookup_expr='in')

    # Цена – теперь с вычислением скидки
    price_min = django_filters.NumberFilter(method='filter_price_min')
    price_max = django_filters.NumberFilter(method='filter_price_max')

    # Остальные фильтры остаются без изменений
    has_discount = django_filters.BooleanFilter(method='filter_has_discount')
    rating_min = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    rating_max = django_filters.NumberFilter(field_name='rating', lookup_expr='lte')

    class Meta:
        model = Course
        fields = []

    def filter_price_min(self, queryset, name, value):
        if value is None:
            return queryset
        return queryset.annotate(
            discounted_price=ExpressionWrapper(
                F('price') * (1 - F('discount') / 100.0),
                output_field=DecimalField(max_digits=10, decimal_places=2)
            )
        ).filter(discounted_price__gte=value)

    def filter_price_max(self, queryset, name, value):
        if value is None:
            return queryset
        return queryset.annotate(
            discounted_price=ExpressionWrapper(
                F('price') * (1 - F('discount') / 100.0),
                output_field=DecimalField(max_digits=10, decimal_places=2)
            )
        ).filter(discounted_price__lte=value)

    def filter_has_discount(self, queryset, name, value):
        if value:
            return queryset.filter(discount__gt=0)
        return queryset
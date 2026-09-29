export const staticPermissions: any = [
    // Product
    { name: 'product:create', description: 'ایجاد محصول' },
    { name: 'product:update', description: 'ویرایش محصول' },
    { name: 'product:read', description: 'مشاهده لیست محصولات' },
    { name: 'product:read-one', description: 'مشاهده یک محصول' },
    { name: 'product:soft-delete', description: 'حذف نرم محصول' },
    { name: 'product:hard-delete', description: 'حذف دائمی محصول' },
    { name: 'product:upload', description: 'آپلود فایل برای محصول' },

    // Category
    { name: 'category:create', description: 'ایجاد دسته‌بندی' },
    { name: 'category:update', description: 'ویرایش دسته‌بندی' },
    { name: 'category:read', description: 'مشاهده لیست دسته‌بندی‌ها' },
    { name: 'category:read-one', description: 'مشاهده یک دسته‌بندی' },
    { name: 'category:soft-delete', description: 'حذف نرم دسته‌بندی' },
    { name: 'category:hard-delete', description: 'حذف دائمی دسته‌بندی' },
    { name: 'category:upload', description: 'آپلود فایل برای دسته‌بندی' },

    // File
    { name: 'file:read', description: 'دریافت فایل' },
    { name: 'file:delete', description: 'حذف فایل' },

    // Minio
    { name: 'upload:image', description: 'آپلود تصویر' },

    // Variant
    { name: 'variant:create', description: 'ایجاد واریانت' },
    { name: 'variant:update', description: 'ویرایش واریانت' },
    { name: 'variant:read', description: 'مشاهده لیست واریانت‌ها' },
    { name: 'variant:read-one', description: 'مشاهده یک واریانت' },
    { name: 'variant:soft-delete', description: 'حذف نرم واریانت' },
    { name: 'variant:hard-delete', description: 'حذف دائمی واریانت' },
    { name: 'variant:upload', description: 'آپلود فایل برای واریانت' },

    // Property
    { name: 'property:create', description: 'ایجاد ویژگی' },
    { name: 'property:update', description: 'ویرایش ویژگی' },
    { name: 'property:read', description: 'مشاهده لیت ویژگی‌ها' },
    { name: 'property:read-one', description: 'مشاهده یک ویژگی‌' },
    { name: 'property:delete', description: 'حذف ویژگی‌' },

    // PropertyValue
    { name: 'property-value:create', description: 'ایجاد مقدار ویژگی' },
    { name: 'property-value:update', description: 'ویرایش مقدار ویژگی' },
    { name: 'property-value:read', description: 'مشاهده لیست مقدار ویژگی' },
    { name: 'property-value:read-one', description: 'مشاهده یک مقدار ویژگی' },
    { name: 'property-value:delete', description: 'حذف مقدار ویژگی' },

    // Role
    { name: 'role:create', description: 'ایجاد نقش جدید' },
    { name: 'role:update', description: 'ویرایش نقش' },
    { name: 'role:delete', description: 'حذف نقش' },
    { name: 'role:list', description: 'نمایش لیست نقش‌ها' },

    // User
    { name: 'user:create', description: 'ایجاد کاربر' },
    { name: 'user:role-assign', description: 'ایجاد نقش برای کاربر' },
    { name: 'user:update', description: 'ویرایش اطلاعات کاربر' },
    { name: 'user:read', description: 'مشاهده لیست کاربران' },
    { name: 'user:read-one', description: 'مشاهده یک کاربر' },
    { name: 'user:soft-delete', description: 'حذف نرم کاربر' },
    { name: 'user:hard-delete', description: 'حذف دائمی کاربر' },
    { name: 'user:update-token', description: 'به‌روزرسانی توکن کاربر' },
    { name: 'user:update-status', description: 'تغییر وضعیت فعال/غیرفعال کاربر' },

    //permission
    { name: 'permission:read', description: 'مشاهده لیست مجوز ها' },

    //basket
    { name: 'basket:read', description: 'مشاهده لیست سبدهای خرید' },
    { name: 'basket:read-one', description: 'مشاهده یک سبد خرید' },
];

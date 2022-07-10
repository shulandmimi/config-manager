# config

文件管理系统

## 基础单位

```yaml
Group:
    storage: DiskStorage
    items: Item[]

Item:
    resource: Resource

Resource:
    items:
        - ref File
        - ref virual Content
    name: string

Storage:
DiskStorage:
    set:
    get:
    remove:
    clear:
```

storage in Group
文件变动较大
对单文件进行压缩，避免占用空间过大

storage in Item
文件碎片化，压缩质量低

---
layout: post
title: Java注解总结
subtitle: Java Annotation
date: 2017-02-11
author: Jerry
header-style: text
catalog: true
tags:
- Java
---

### 注解的分类

#### 按照运行机制分

1. 源码注解： 注解只在源码中存在，编译成 ```.class``` 文件就不存在。
2.  编译时注解： 注解在源码和```.class```文件中都存在。例如JDK中```@Override```、```@Deprecated```、```@Suppvisewarnings```。
3.  运行时注解 ：在运行阶段还起作用，甚至会影响运行逻辑的注解。例如Spring中的```@Autowired```。

#### 按来源来分

1. 来自JDK的注解
2. 来自第三方的注解
3. 自定义注解

### 自定义注解语法要求

``` java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface Description { // 使用@interface关键字定义注解

    String desc();  // 成员以无参无异常方式声明,返回类型就是参数的类型

    int age() default 18;   // 可以用default为成员指定一个默认值
}
```

**注意点：**
1. 使用```@interface```自定义注解时，自动继承了```java.lang.annotation.Annotation```接口，由编译程序自动完成其他细节。在定义注解时，不能继承其他的注解或接口。
2. 成员类型是受限的，合法的类型包括```原始基本类型```及```String```,```Class```,```Annotation```,```Enumeration```以及以上所有类型的```数组```
3. 如果注解只有**一个**成员，则成员名必须取名为```value()```，在使用时可以忽略成员名和赋值号（=）
4. 注解类可以没有成员，没有成员的注解称为标识注解。

#### 元注解（meta-annotation）

> 元注解即注解的注解，我们用元注解来定义其他注解。JDK5定义了4个标准meta-annotation类型，分别是```@Target```、```@Retention```、```@Documented```、```@Inherited```

#####  @Target

说明注解所修饰的对象范围，指注解可以用在什么地方。

1. ```CONSTRUCTOR```:用于描述构造器
2. ```FIELD```:用于描述域
3. ```LOCAL_VARIABLE```:用于描述局部变量
4. ```METHOD```:用于描述方法
5. ```PACKAGE```:用于描述包
6. ```PARAMETER```:用于描述参数
7. ```TYPE```:用于描述类、接口(包括注解类型) 或enum声明

##### @Retention

即上文提到的注解在什么时候起作用。

1. ```SOURCE```: 在源文件中有效（即源文件保留）
2. ```CLASS```: 在class文件中有效（即class保留）
3. ```RUNTIME```: 在运行时有效（即运行时保留）

##### @Documented

用于描述其它类型的annotation应该被作为被标注的程序成员的公共API，因此可以被例如```javadoc```此类的工具文档化。它是一个标记注解，没有成员。

##### @Inherited

它是一个标记注解，@Inherited阐述了某个被标注的类型是被继承的。如果一个使用了@Inherited修饰的annotation类型被用于一个class，则这个annotation将被用于该class的子类。

### 解析注解

通过反射获取类、函数或成员上的```运行时```注解信息，从而实现动态控制程序运行的逻辑。

``` java
@Description(desc = "I am class annotation")
public class Foo {
    @Description(desc = "I am method annotation")
    public String test() {
        return null;
    }
}
```

``` java
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;

public class Test {

    public static void main(String[] args) {
        // 1、使用类加载器加载类
        try {
            Class c = Class.forName("me.shenchao.annotation.Foo");
            // 2、找到类上面的注解
            boolean isExist = c.isAnnotationPresent(Description.class);
            if (isExist) {
                // 3、拿到注解实例
                Description d = (Description) c.getAnnotation(Description.class);
                System.out.println(d.desc());
            }
            // 4、 找到方法上的注解
            Method[] methods = c.getMethods();
            for (Method method : methods) {
                boolean isMExist = method.isAnnotationPresent(Description.class);
                if (isMExist) {
                    Description d = method.getAnnotation(Description.class);
                    System.out.println(d.desc());
                }
            }

            // 另一种解析方法
            for (Method method : methods) {
                Annotation[] annotations = method.getAnnotations();
                for (Annotation annotation : annotations) {
                    if (annotation instanceof Description){
                        Description d = (Description) annotation;
                        System.out.println(d.desc());
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```

### Reference
- 慕课网《Java注解》
- http://www.cnblogs.com/peida/archive/2013/04/24/3036689.html



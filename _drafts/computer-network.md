---
layout: post
title: 趣谈网络协议
date: 2018-12-17
author: Jerry
header-style: text
catalog: true
tags:
 - 读书笔记
 - 计算机网路
---

## 网络分层的真实含义

1. 只要是在网络上跑的包，都是完整的。可以有下层没上层（例如MAC层发现不是发给本机的包后，直接丢弃），但是不可能有上层没下层的情况出现
2. 网络分层的目的在于解决复杂度问题，上层总是依赖于下层，并不是能够独立存在

## ifconfig&ip addr 发生了什么

### 需要掌握的基础：
- IP地址划分，A/B/C/D/E共5类。
- 无类型域间选路 CIDR
- 如何计算网络号、子网掩码等
- 知道IP中公网地址与私有地址的范围

### 既然MAC地址全世界唯一，为什么不直接用MAC地址通信，还要引入IP

要实现能够两台主机的通信，还需要定位功能，如果直接用MAC地址通信，那么需要建立的映射关系将特别多，考虑到当前如此多的计算机，建立如此大的映射关系不现实，所以引入IP进行定位功能。只有在同一个网络号里面的主机才能用MAC地址进行通信。

### ip addr 详解


`ifconfig`属于`net-tools`工具包，而`ip addr`来自`iproute2`工具包，`iproute2`工具包的出现旨在替换`net-tools`，因为其增加了更多新特性，以及更加统一的命名方法，更加容易使用。但由于历史遗留原因，`net-tools`工具包仍然被广泛应用于现在的系统中。

```
root@test:~# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default 
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether fa:16:3e:c7:79:75 brd ff:ff:ff:ff:ff:ff
    inet 10.100.122.2/24 brd 10.100.122.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::f816:3eff:fec7:7975/64 scope link 
       valid_lft forever preferred_lft forever

```
以上命令列出了系统中当前存在的所有网卡。

`lo` 表示`loopback`，又称环回接口，往往被分配到`127.0.0.1`这个地址上。这个地址用于**本机通信**，经过**内核处理后直接返回**，不会在任何网络中出现。与此对应的，`scope`中host表示这张网卡仅仅可以供本机相互通信。而global表示这张网卡是可以对外的。

`UP`表示网卡处于启动状态

`BROADCAST`表示这个网卡有广播地址，可以发送广播包

`MULTICAST`表示该网卡可以发送多播包

`LOWER_UP`表示L1是启动的，也即使用网线联网。

`MTU 1500`对应于MAC层允许支持的最大报文长度，即MAC头部加上上层传下来的报文之和最大为1500字节，如果过长就要进行分片。1500为以太网的默认值

`qdisc`为`queueing discipline`，称为排队规则。内核如果需要通过某个网络接口发送数据包，都需要按照这里配置的规则进行发送。其选项最简单的为`pfifo`，表示不对数据包做任何处理，按照先入先出发送。`pfifo_fast`相对复杂，包括三个波段（band），每个波段优先级不同，先发送优先级高的数据包，而在每个波段中使用先进先出。数据包是按照服务类型（Type of Service, TOS）决定到哪一个波段，TOS是IP头部里面的一个字段，代表了当前包的优先级大小。


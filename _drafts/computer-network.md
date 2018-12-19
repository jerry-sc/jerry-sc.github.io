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

### 各层之间调用实现方式

下层是知道上层的存在的，可以通过每一层包头里面查看上层用的是什么协议。每一层的处理函数都会在OS启动的时候，注册到内核一个数据结构里面。当数据包到达某一层的时候，通过判断上层是什么协议，然后去找相应的处理函数去调用

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

`MTU 1500`对应于MAC层允许支持的最大报文长度，加上MAC头部尾部最大共1518字节，如果过长就要进行分片。1500为以太网的默认值。此外，TCP层有一个MSS(Maximum Segment Size，最大分段大小)，它等于MTU减去IP头，再减去TCP头的长度。即在不分片的情况下，TCP里面放的最大内容

`qdisc`为`queueing discipline`，称为排队规则。内核如果需要通过某个网络接口发送数据包，都需要按照这里配置的规则进行发送。其选项最简单的为`pfifo`，表示不对数据包做任何处理，按照先入先出发送。`pfifo_fast`相对复杂，包括三个波段（band），每个波段优先级不同，先发送优先级高的数据包，而在每个波段中使用先进先出。数据包是按照服务类型（Type of Service, TOS）决定到哪一个波段，TOS是IP头部里面的一个字段，代表了当前包的优先级大小。

## DHCP与PXE

### 手动指定IP地址
在Linux中，当某台机器想要向其他机器发送包时，首先会进行判断，要去的这个地址和本机是同一个网段吗，只有是同一个网段的，它才会发送ARP请求，获取MAC地址。

否则，默认逻辑为：如果是一个跨网段调用，它便不会直接将包发送到网络上，而是企图将包发送到网关。也就是本网段的其他主机无法收到该包，这也要求了手动指定的IP地址必须准确无误。

### DHCP
> 动态主机配置协议（Dynamic Host Configuration Protocol, DHCP）

相当于，预先配置好一段共享的IP地址，每一台新接入的机器都通过DHCP协议，来申请IP，用完后，还回去。

***工作方式***

1. DHCP Discover：新来机器使用IP为0.0.0.0发送一个广播包，目的IP为：255.255.255.255，以及使用本机的MAC地址作为源地址，而使用ff:ff:ff:ff:ff:ff作为目的MAC地址。广播包为一个**UDP**包，
2. DHCP Offer：DHCP Server收到该请求后，为其授权分配一个IP地址，并设定了授权的时间、网关、子网掩码等信息，同时保证不会将该IP分配给其他的主机。offer阶段，MAC目的地址与IP目的地址仍然都使用广播地址（因为请求分配IP的主机仍然不知道自己的IP地址）
3. DHCP Request：如果局域网内存在多个DHCP Server，那么这台机器会收到多个IP地址。通常它会选择最先到达的DHCP Offer。然后向网络中发送一个DHCP request**广播**数据包，告诉所有DHCP Server它接受了哪一台服务器提供的IP，并让其他服务器撤销之前的分配，用于分配给其他申请者。由于此时客户机还没有真正确定自己的IP，所以仍然使用0.0.0.0作为源IP，MAC/IP层使用广播地址作为目的地址。
4. 最后，DHCP Server会发送一个广播包ACK告知大家，新加入的成员。

上面可以看到，DHCP分配的IP是有租期的，客户机在租期过去50%的时候，直接向为其分配IP地址的服务器发送DHCP request包要求续期，当收到服务器的ACK响应后，会根据ACK中提供的信息，更新本机的信息。

### PXE

这里不记录了，只要了解下PXE的作用即可，具体再看文章。

> 预启动执行环境（Pre-boot Execution Environment, PXE）主要用于批量的安装操作系统。多用于数据中心中，在云计算中有较大用处

## 从物理层到MAC层

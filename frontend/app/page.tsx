"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import {
  Coffee,
  MapPin,
  Clock,
  ArrowRight,
  ChevronDown,
  Star,
  Leaf,
  Heart,
  Instagram,
  Check,
  Plus,
  Menu,
  X,
} from "lucide-react";
import HeaderAuth from "@/components/HeaderAuth";
import styles from "./page.module.css";

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: EASE },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: EASE },
  }),
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: <Coffee size={24} />,
    title: "스페셜티 원두",
    desc: "전 세계에서 엄선한 싱글 오리진 원두를 매일 신선하게 로스팅합니다.",
  },
  {
    icon: <Leaf size={24} />,
    title: "유기농 재료",
    desc: "친환경 유기농 재료로 정성껏 준비한 건강한 메뉴를 제공합니다.",
  },
  {
    icon: <Heart size={24} />,
    title: "따뜻한 공간",
    desc: "편안한 인테리어와 잔잔한 음악이 흐르는 아늑한 휴식 공간입니다.",
  },
];

const SHOWCASE_BADGES = ["추천", "NEW", "인기"] as const;

/** 카테고리명을 음료/빵/기타로 그룹화 */
function menuGroup(categoryName: string): "음료" | "빵" | "기타" {
  const n = (categoryName ?? "").toLowerCase();
  if (/커피|음료|티|라떼|에스프레소|주스|스무디|ade|tea|coffee|drink/i.test(n)) return "음료";
  if (/빵|베이커리|케이크|크루아상|토스트|샌드위치|bread|bakery|pastry/i.test(n)) return "빵";
  return "기타";
}

interface ShowcaseMenu {
  id: number;
  korName: string;
  description: string;
  price: number;
  categoryName: string;
  imageSrc: string;
  badge: (typeof SHOWCASE_BADGES)[number];
}

function menuImageUrl(imageSrc: string | null | undefined): string {
  if (!imageSrc?.trim()) return "";
  if (imageSrc.startsWith("http")) return imageSrc;
  const filename = imageSrc.replace(/^.*\//, "").trim() || "missing";
  return `/images/${filename}`;
}

/** 메뉴 목록에서 음료·빵·기타 각 1개씩 뽑고 배지 부여 */
function pickShowcaseMenus(menus: Omit<ShowcaseMenu, "badge">[]): ShowcaseMenu[] {
  const groups: { 음료: typeof menus; 빵: typeof menus; 기타: typeof menus } = {
    음료: [],
    빵: [],
    기타: [],
  };
  menus.forEach((m) => {
    const g = menuGroup(m.categoryName);
    groups[g].push(m);
  });
  const order: ("음료" | "빵" | "기타")[] = ["음료", "빵", "기타"];
  const result: ShowcaseMenu[] = [];
  order.forEach((key, i) => {
    const first = groups[key][0];
    if (first) result.push({ ...first, badge: SHOWCASE_BADGES[i] ?? "추천" });
  });
  while (result.length < 3 && menus.length > 0) {
    const next = menus.find((m) => !result.some((r) => r.id === m.id));
    if (!next) break;
    result.push({ ...next, badge: SHOWCASE_BADGES[result.length] ?? "추천" });
  }
  return result.slice(0, 3);
}

const aboutFeatures = [
  "스페셜티 등급 원두",
  "매일 신선한 로스팅",
  "자체 베이커리",
  "반려동물 동반 가능",
];

/* ------------------------------------------------------------------ */
/*  AnimatedSection — viewport에 진입하면 애니메이션 실행               */
/* ------------------------------------------------------------------ */
function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.section>
  );
}

/* ================================================================== */
/*  Main Page Component                                                */
/* ================================================================== */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showcaseMenus, setShowcaseMenus] = useState<ShowcaseMenu[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/menus")
      .then((res) => res.ok ? res.json() : Promise.resolve({ menus: [] }))
      .then((data: { menus?: Omit<ShowcaseMenu, "badge">[] }) => {
        if (cancelled) return;
        const list = data.menus ?? [];
        setShowcaseMenus(pickShowcaseMenus(list));
      })
      .catch(() => {
        if (!cancelled) setShowcaseMenus([]);
      });
    return () => { cancelled = true; };
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* ============== Navigation ============== */}
      <nav
        className={`${styles.nav} ${scrolled ? styles.navScrolled : ""} ${mobileMenuOpen ? styles.navMobileOpen : ""}`}
        id="nav"
      >
        <a
          href="#"
          className={`${styles.navBrand} ${scrolled ? styles.navBrandScrolled : ""}`}
        >
          <span className={styles.navBrandMark}>N</span>
          <span className={styles.navBrandText}>Cafe</span>
        </a>

        <button
          type="button"
          className={styles.navMobileTrigger}
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={styles.navLinks}>
          <a
            href="#features"
            className={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ""}`}
            onClick={closeMobileMenu}
          >
            About
          </a>
          <Link
            href="/menus"
            className={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ""}`}
            onClick={closeMobileMenu}
          >
            Menu
          </Link>
          <a
            href="#about"
            className={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ""}`}
            onClick={closeMobileMenu}
          >
            Story
          </a>
          <HeaderAuth
            compact
            wrapperClassName={scrolled ? styles.navLinkScrolled : ""}
            loginLinkClassName={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ""}`}
            authClassName={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ""}`}
          />
          <a
            href="#visit"
            className={`${styles.navCta} ${scrolled ? styles.navCtaScrolled : ""}`}
            onClick={closeMobileMenu}
          >
            Reserve
          </a>
        </div>
      </nav>

      {/* 모바일 슬라이딩 메뉴: 오버레이 (클릭 시 닫기) */}
      <div
        className={`${styles.navOverlay} ${mobileMenuOpen ? styles.navOverlayOpen : ""}`}
        onClick={closeMobileMenu}
        aria-hidden
      />

      {/* ============== Hero Section ============== */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />

        <motion.div
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            className={styles.heroTagline}
            variants={fadeUp}
            custom={0}
          >
            Specialty Coffee & Brunch
          </motion.span>

          <motion.h1 className={styles.heroTitle} variants={fadeUp} custom={1}>
            <span className={styles.heroTitleSerif}>Where every cup</span>
            <br />
            <span className={styles.heroTitleSans}>tells a story</span>
          </motion.h1>

          <motion.p
            className={styles.heroDescription}
            variants={fadeUp}
            custom={2}
          >
            매일 아침, 엄선한 원두로 정성껏 내린 한 잔이
            <br />
            당신의 하루를 특별하게 만들어 드립니다.
          </motion.p>

          <motion.div
            className={styles.heroButtons}
            variants={fadeUp}
            custom={3}
          >
            <Link href="/menus" className={styles.btnPrimary}>
              Explore Menu
              <ArrowRight size={16} />
            </Link>
            <a href="#about" className={styles.btnSecondary}>
              Our Story
            </a>
          </motion.div>
        </motion.div>

        <div className={styles.heroScrollIndicator}>
          <span>SCROLL</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ============== Features Section ============== */}
      <AnimatedSection className={`${styles.section} ${styles.features}`}>
        <div className={styles.sectionHeader} id="features">
          <motion.span
            className={styles.sectionLabel}
            variants={fadeUp}
            custom={0}
          >
            Why NCafe
          </motion.span>
          <motion.h2
            className={styles.sectionTitle}
            variants={fadeUp}
            custom={1}
          >
            NCafe가 특별한 이유
          </motion.h2>
          <motion.p
            className={styles.sectionSubtitle}
            variants={fadeUp}
            custom={2}
          >
            좋은 원두, 정직한 재료, 진심을 담은 공간.
            <br />세 가지 약속으로 여러분을 맞이합니다.
          </motion.p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className={styles.featureCard}
              variants={scaleIn}
              custom={i}
            >
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDescription}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ============== Menu Showcase ============== */}
      <AnimatedSection className={`${styles.section} ${styles.menuShowcase}`}>
        <div className={styles.sectionHeader} id="menu">
          <motion.span
            className={styles.sectionLabel}
            variants={fadeUp}
            custom={0}
          >
            Menu
          </motion.span>
          <motion.h2
            className={styles.sectionTitle}
            variants={fadeUp}
            custom={1}
          >
            인기 메뉴
          </motion.h2>
          <motion.p
            className={styles.sectionSubtitle}
            variants={fadeUp}
            custom={2}
          >
            신선한 재료로 매일 정성껏 준비하는 NCafe의 시그니처 메뉴
          </motion.p>
        </div>

        <div className={styles.menuGrid}>
          {showcaseMenus.length === 0 ? (
            [...Array(3)].map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                className={styles.menuCard}
                variants={scaleIn}
                custom={i}
              >
                <div className={styles.menuCardImage}>
                  <div className={styles.menuCardImagePlaceholder} />
                </div>
                <div className={styles.menuCardBody}>
                  <h3 className={styles.menuCardName}>메뉴를 불러오는 중</h3>
                  <p className={styles.menuCardDesc}>...</p>
                  <div className={styles.menuCardFooter}>
                    <span className={styles.menuCardPrice}>-</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            showcaseMenus.map((menu, i) => {
              const imgUrl = menuImageUrl(menu.imageSrc);
              return (
                <motion.div
                  key={menu.id}
                  className={styles.menuCard}
                  variants={scaleIn}
                  custom={i}
                >
                  <div className={styles.menuCardImage}>
                    {imgUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imgUrl}
                        alt={menu.korName}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          const placeholder = (e.target as HTMLImageElement).nextElementSibling;
                          if (placeholder) (placeholder as HTMLElement).style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={styles.menuCardImagePlaceholder}
                      style={{ display: imgUrl ? "none" : "flex" }}
                    >
                      이미지 없음
                    </div>
                    <span className={styles.menuCardBadge}>{menu.badge}</span>
                  </div>
                  <div className={styles.menuCardBody}>
                    <h3 className={styles.menuCardName}>{menu.korName}</h3>
                    <p className={styles.menuCardDesc}>{menu.description || ""}</p>
                    <div className={styles.menuCardFooter}>
                      <span className={styles.menuCardPrice}>
                        {menu.price.toLocaleString()}원
                      </span>
                      <Link
                        href={`/menus/${menu.id}`}
                        className={styles.menuCardAction}
                        aria-label={`${menu.korName} 상세보기`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Plus size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </AnimatedSection>

      {/* ============== About / Story ============== */}
      <AnimatedSection className={`${styles.section} ${styles.about}`}>
        <div className={styles.aboutGrid} id="about">
          {/* Image Side */}
          <motion.div
            className={styles.aboutImageWrapper}
            variants={fadeUp}
            custom={0}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80"
              alt="NCafe 매장 내부"
              loading="lazy"
            />
            <div className={styles.aboutImageOverlay}>
              <div className={styles.aboutStat}>
                <div className={styles.aboutStatItem}>
                  <div className={styles.aboutStatNumber}>12+</div>
                  <div className={styles.aboutStatLabel}>원두 종류</div>
                </div>
                <div className={styles.aboutStatItem}>
                  <div className={styles.aboutStatNumber}>3,000+</div>
                  <div className={styles.aboutStatLabel}>행복한 고객</div>
                </div>
                <div className={styles.aboutStatItem}>
                  <div className={styles.aboutStatNumber}>4.9</div>
                  <div className={styles.aboutStatLabel}>
                    <Star
                      size={12}
                      fill="currentColor"
                      style={{ display: "inline", verticalAlign: "-1px" }}
                    />{" "}
                    평점
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div className={styles.aboutContent} variants={fadeUp} custom={1}>
            <span className={styles.aboutLabel}>Our Story</span>
            <h2 className={styles.aboutTitle}>
              한 잔의 커피가
              <br />
              만드는 작은 행복
            </h2>
            <p className={styles.aboutText}>
              NCafe는 &ldquo;좋은 커피, 좋은 시간&rdquo;이라는 철학으로
              시작되었습니다. 우리는 에티오피아, 콜롬비아, 과테말라 등 세계 각지의
              농장에서 직접 선별한 그린빈을 소량씩 로스팅하여 가장 신선한 상태로
              여러분께 제공합니다.
            </p>
            <p className={styles.aboutText}>
              바쁜 일상 속에서도 커피 한 잔의 여유가 삶을 더 풍요롭게 만든다고
              믿습니다. NCafe에서 당신만의 특별한 시간을 보내세요.
            </p>

            <div className={styles.aboutFeatures}>
              {aboutFeatures.map((feat) => (
                <div key={feat} className={styles.aboutFeatureItem}>
                  <span className={styles.aboutFeatureIcon}>
                    <Check size={14} />
                  </span>
                  {feat}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ============== CTA Section ============== */}
      <AnimatedSection className={styles.cta}>
        <div className={styles.ctaImageSide}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=960&q=80"
            alt="NCafe 매장"
            loading="lazy"
          />
        </div>
        <motion.div
          className={styles.ctaContent}
          id="visit"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2
            className={styles.ctaTitle}
            variants={fadeUp}
            custom={0}
          >
            <span className={styles.heroTitleSerif}>Savor the moment,</span>
            <br />
            <span className={styles.heroTitleSans}>one cup at a time</span>
          </motion.h2>
          <motion.p
            className={styles.ctaDescription}
            variants={fadeUp}
            custom={1}
          >
            정성스레 내린 한 잔의 커피와 함께,
            <br />
            일상 속 작은 사치를 허락하세요.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className={styles.ctaDetails}>
            <span className={styles.ctaTime}>
              <Clock size={14} />
              매일 08:00 – 22:00
            </span>
          </motion.div>
          <motion.div variants={fadeUp} custom={3}>
            <a href="#visit" className={styles.ctaButton}>
              <MapPin size={16} />
              Find Us
            </a>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* ============== Footer ============== */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerBrand}>
              <span className={styles.footerBrandMark}>N</span>Cafe
            </div>
            <p className={styles.footerBrandDesc}>
              좋은 원두, 따뜻한 공간, 진심을 담은 한 잔.
              <br />
              NCafe에서 당신만의 시간을 보내세요.
            </p>
          </div>

          <div>
            <h4 className={styles.footerColumnTitle}>메뉴</h4>
            <Link href="/menus?category=커피" className={styles.footerLink}>커피</Link>
            <Link href="/menus?category=브런치" className={styles.footerLink}>브런치</Link>
            <Link href="/menus?category=디저트" className={styles.footerLink}>디저트</Link>
            <Link href="/menus?category=음료" className={styles.footerLink}>음료</Link>
          </div>

          <div>
            <h4 className={styles.footerColumnTitle}>안내</h4>
            <Link href="/#visit" className={styles.footerLink}>매장 위치</Link>
            <Link href="/#visit" className={styles.footerLink}>영업 시간</Link>
            <a href="#" className={styles.footerLink}>이벤트</a>
            <a href="#" className={styles.footerLink}>채용</a>
          </div>

          <div>
            <h4 className={styles.footerColumnTitle}>운영 시간</h4>
            <p className={styles.footerLink} style={{ cursor: "default" }}>
              <Clock size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: "6px" }} />
              월-금 08:00 – 22:00
            </p>
            <p className={styles.footerLink} style={{ cursor: "default" }}>
              <Clock size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: "6px" }} />
              토-일 09:00 – 22:00
            </p>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span className={styles.footerCopyright}>
            © 2024 NCafe. All rights reserved.
          </span>
          <div className={styles.footerSocials}>
            <a href="#" className={styles.footerSocial} aria-label="Instagram">
              <Instagram size={16} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

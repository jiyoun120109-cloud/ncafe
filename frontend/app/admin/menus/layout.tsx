export default function MenusLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section>
            {/* 메뉴 관리 영역에만 공통으로 적용할 UI가 있다면 여기에 추가 (예: 탭 메뉴) */}
            {children}
        </section>
    );
}

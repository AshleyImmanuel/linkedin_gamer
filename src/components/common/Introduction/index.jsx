import React from "react";
import "./index.scss";

export default function Introduction({ scrollToFeed }) {
  const trendingGames = [
    {
      id: 1,
      title: "Warriors Game",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAzhgU6NjOwxFdWppb4VNATJTXrh9HVL-ztI-XlbUdWSKwDOaLgpFE8AR8F-94QBiJoy3H-Y1Bg7kSCmj-PqE81Fy3oluy60e6i16iwN_zOEDxgJ0gXDHwQeHZHka8DT21nXjOTdMyvrLp1hoAlfXb7iFOZIG6YfYPmOZvgmZZkaew7kk_ocLlH5lFWGQQKisBZZguNQ6uWhgs-yqB5dTw3hvmzR6O5c-FlbUuA7TscYfyPu3HxJUmN",
      followers: "40 Followers",
    },
    {
      id: 2,
      title: "Futuristic Game",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD2ZK2EQHnf8gKE8iPljUIBzp7zE7yhp_X3xiHwwXJjkbHmak_L-LH2tZ3AhtIot3CgtjIkZlkxYYd1gb9MrWgBoDgFCXjMqSEPhOlNTU36o3ALN1QxZ7C4_lHBfE0TR-zzWvuff2DcwZbdtXHOwIfbtqDUz1whzRc5hMYoxs3RuIPrDgyKnpxSYpcWuZ3p4W1jAj3baLjBHZiAjW_AdEeC-ubxfBDww187kxPchAxsalgt17EtAg0n",
      followers: "40 Followers",
    },
    {
      id: 3,
      title: "Soldier Game",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA7vsKcsDTB8vRm-2lID5rXYdZ-WMXeaJAFnzu-mSyebiqHkpDJjsKUqQw23p9s--oWGkb6bSkfsvM9trHrd2R9Iyy3M-1iWT9_b3goUWwEczBCrgHEjqm8UiME4dOpKlW0coVvZupZZXplrJWMdh9s8bYLKMqHYi1KNp7JtD94hajuQSaF_BYWYLXZC5lo_FhzHVWug28m6Hn1OPX8z2DY_yKPk_yjL-lSFKNQU1zfeIZz73r2-8IV",
      followers: "40 Followers",
    },
    {
      id: 4,
      title: "Cyberpunk Game",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDzQNKWD-RysW27LDUa2dLdueIrwIcVRh86WKECgXbTipwX2P0BWHV3zlLGQfN8TeUvSIAoFNUnM5ocK7aUo-UqHws31_geoMuCGEbi6gUQe8289xqanzXfpRzttLB9MZc07OtLgd5qsCL82kpiIAttZw-JzkauQszZOOv80lstjgU5Fe3ecNwoYEMhPCVT6uskxBkI_CEEAVJ--TsK3Ax1wjiAgucLN9cBKsSQJuGagI6fUkC1OOSR",
      followers: "40 Followers",
    },
  ];

  const handleScrollDown = (e) => {
    e.preventDefault();
    if (scrollToFeed) {
      scrollToFeed();
    } else {
      const feedElement = document.getElementById("community-feed-section");
      if (feedElement) {
        feedElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="intro-wrapper">
      {/* Hero Section */}
      <section className="intro-hero-section">
        <div className="intro-hero-content">
          <div className="intro-badge">3D Game Dev</div>
          <h1 className="intro-title">
            Work that we <br />
            produce for our <br />
            clients
          </h1>
          <p className="intro-description">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard.
          </p>
          <div className="intro-cta-buttons">
            <a
              href="#community-feed-section"
              onClick={handleScrollDown}
              className="intro-cta-btn primary"
            >
              Get more details
            </a>
          </div>
        </div>

        {/* Hero Visual Area */}
        <div className="intro-hero-visual">
          <img
            alt="3D Game Controller"
            className="intro-gamepad-img"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyk5oq-ZxTMnSlXOiAmOuNrmL4B_myuV-gbltbxNVtDQKHB6AYX9Dkxbl6zkugD3MHxAuslO9IFBE_ETAoeNIEYEXzdc3KQXaGcSX3mujEIes-qneKSpghSA3hRGu9ZbcwDpW5BR9gcu2Rs2kVGtr0APArIKCE45NrC20SZiBOVqPmlzytRQcjOGSGBAvu1vCZiLOiJ6ivzUiOdkcdJCioLEF7GSFUQanmdGOi2zyQScLGP-Qjtwau"
          />
          <img
            alt="CryEngine Logo"
            className="intro-engine-logo cryengine"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjLK0R1gOm0-77xp32LOQ_smu7z44huP64CViDUWzI6-J3jr95vUWx0uQ-btsosqlfunjF15Ka4GVZj7tyE_fVpCD7icSoWjpyXn1-HkqmWXfN_XizDMK0SvpYG1nw1gAkHOlLOSyrFn7MiyIXIRZkwctNRc5QnKu-Nfp0doTjxbKElmCNJaag9Vfsd1xv8BKtweeDtvek2_Uht6e_9MvzDJF0hgeOM0plSLsaUihtwLt2aljwtYLz"
          />
          <img
            alt="Unreal Engine Logo"
            className="intro-engine-logo unreal"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAj8hKM68KEQp39IZ5VAI60h6fzCUadzGg2OIRL9Wp-fx29mDJLp1hdtM4NUs1uuyZK9UWHpPB9ay6NT3y_6gDMBVtDeMXRGXmUDLpwjtUOM568IASbNponpS11KZT4Hf-iO81b6c10bhhn03MRuSjT0viBkLLztAJruT_WUUmteXp_x4M-ggTJzC2URm0ma5Xp20vqNqbnNTRRmKPPHZFpk6YchVT_RfijUT156LPLKD9NuQRLy5SG"
          />
          <img
            alt="Unity Logo"
            className="intro-engine-logo unity"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBowzj0EuykIcalyBA5qA_nDXP45KFbTNEk5ucenQqiTbacteObq3ZNGx5t843RTlDaKya7FCXeZsi9Tkp0xGad04jqlP5gZEJIiwT7I2yIY9Z-9YXtmdB8-hFY-yFWUndV-NG02-iqYc_wmrtjHSnvpauGZZzngoMaXBRO8d94eFVZb9v1wyDD7a4cx2Hz8Xn71rg1cuWoWyt5CNCenWJkU0SLKmcjc9RbzNZejmKewzUM68gI12zp"
          />
        </div>
      </section>

      {/* Trending Games Section */}
      <section className="intro-trending-section">
        <div className="intro-trending-header">
          <h2>Currently Trending Games</h2>
          <button className="see-all-btn">SEE ALL</button>
        </div>

        <div className="intro-games-grid">
          {trendingGames.map((game) => (
            <div key={game.id} className="intro-game-card">
              <div className="game-card-img-container">
                <img src={game.image} alt={game.title} />
              </div>
              <div className="game-card-info">
                <svg
                  className="flame-icon"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                    fillRule="evenodd"
                  />
                </svg>
                <span>{game.followers}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Text / Tagline Section */}
      <section className="intro-bottom-section">
        <h3>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </h3>
      </section>

      {/* Feed Divider Indicator */}
      <div className="intro-feed-divider">
        <span>Community Feed & Updates</span>
      </div>
    </div>
  );
}
